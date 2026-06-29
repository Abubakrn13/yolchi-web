// SQLite baza wrapper — sql.js bilan (sof JS, Windows'da C++ kompilyator kerak emas).
// Webpack ichida 'sql.js' external sifatida belgilangan, lekin require.resolve ham
// webpack tomonidan stub qilingani uchun WASM faylini node_modules'dan to'g'ridan
// olamiz va `wasmBinary` orqali sql.js'ga uzatamiz.
import path from 'node:path';
import fs from 'node:fs';

type SqlJsDatabase = any;
type SqlJsStatic = any;

// Webpack require'ni emas, Node'ning toza require'ini eval orqali olamiz.
// Bu webpack tomonidan o'zgartirilmaydi.
// eslint-disable-next-line @typescript-eslint/no-implied-eval, no-eval
const nodeRequire: NodeRequire = eval('require');

const DB_FILE = process.env.DATABASE_FILE || path.join(process.cwd(), 'yolchi.db');

let SQL: SqlJsStatic | null = null;
let dbInstance: SqlJsDatabase | null = null;
let writeTimer: NodeJS.Timeout | null = null;
let initPromise: Promise<DbWrapper> | null = null;
let cached: DbWrapper | null = null;

function findSqlJsDir(): string {
  // node_modules ichidan sql.js dist papkasini topish (cwd dan boshlab)
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, 'node_modules', 'sql.js', 'dist');
    if (fs.existsSync(candidate)) return candidate;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  throw new Error('sql.js dist papkasi topilmadi. `npm install` qiling.');
}

async function loadSqlJs(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  const distDir = findSqlJsDir();
  const wasmPath = path.join(distDir, 'sql-wasm.wasm');
  const wasmBinary = fs.readFileSync(wasmPath);
  // sql.js'ni node_modules'dan to'g'ridan yuklash
  const initSqlJs = nodeRequire(path.join(distDir, 'sql-wasm.js'));
  SQL = await initSqlJs({ wasmBinary });
  return SQL!;
}

async function initDb(): Promise<SqlJsDatabase> {
  const SQLite = await loadSqlJs();
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let db: SqlJsDatabase;
  if (fs.existsSync(DB_FILE)) {
    const buf = fs.readFileSync(DB_FILE);
    db = new SQLite.Database(buf);
  } else {
    db = new SQLite.Database();
  }
  initSchema(db);
  seedIfEmpty(db);
  return db;
}

function persist() {
  if (!dbInstance) return;
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    try {
      if (!dbInstance) return;
      const data = dbInstance.export();
      fs.writeFileSync(DB_FILE, Buffer.from(data));
    } catch (e) { console.error('DB persist error:', e); }
  }, 100);
}

export interface RunResult { changes: number; lastInsertRowid: number | bigint }
export interface Statement {
  run: (...params: any[]) => RunResult;
  get: (...params: any[]) => any;
  all: (...params: any[]) => any[];
}
export interface DbWrapper {
  prepare: (sql: string) => Statement;
  exec: (sql: string) => void;
  transaction: <T extends (...args: any[]) => any>(fn: T) => T;
}

function flatten(params: any[]): any[] {
  if (params.length === 1 && Array.isArray(params[0])) return params[0];
  return params;
}

function wrap(d: SqlJsDatabase): DbWrapper {
  return {
    prepare(sql: string): Statement {
      return {
        run(...params: any[]): RunResult {
          const stmt = d.prepare(sql);
          try {
            stmt.bind(flatten(params));
            stmt.step();
            const changes = d.getRowsModified();
            persist();
            return { changes, lastInsertRowid: 0 };
          } finally { stmt.free(); }
        },
        get(...params: any[]): any {
          const stmt = d.prepare(sql);
          try {
            stmt.bind(flatten(params));
            if (stmt.step()) return stmt.getAsObject();
            return undefined;
          } finally { stmt.free(); }
        },
        all(...params: any[]): any[] {
          const stmt = d.prepare(sql);
          try {
            stmt.bind(flatten(params));
            const out: any[] = [];
            while (stmt.step()) out.push(stmt.getAsObject());
            return out;
          } finally { stmt.free(); }
        },
      };
    },
    exec(sql: string) { d.exec(sql); persist(); },
    transaction<T extends (...args: any[]) => any>(fn: T): T {
      return ((...args: any[]) => {
        d.exec('BEGIN');
        try {
          const result = fn(...args);
          d.exec('COMMIT');
          persist();
          return result;
        } catch (e) { d.exec('ROLLBACK'); throw e; }
      }) as T;
    },
  };
}

export async function ensureDb(): Promise<DbWrapper> {
  if (cached) return cached;
  if (!initPromise) {
    initPromise = initDb().then((d) => {
      dbInstance = d;
      cached = wrap(d);
      persist();
      return cached;
    });
  }
  return initPromise;
}

function initSchema(d: SqlJsDatabase) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, phone TEXT UNIQUE, provider TEXT NOT NULL DEFAULT 'phone',
      name TEXT DEFAULT '', photo TEXT, role TEXT, is_admin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY, owner_id TEXT, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
      category_slug TEXT NOT NULL, city TEXT, address TEXT, phone TEXT, lat REAL NOT NULL, lng REAL NOT NULL,
      photos TEXT NOT NULL DEFAULT '[]', menu TEXT, working_hours TEXT, booking_price INTEGER,
      is_bookable INTEGER NOT NULL DEFAULT 0, price_level INTEGER NOT NULL DEFAULT 2,
      rating_avg REAL NOT NULL DEFAULT 0, rating_count INTEGER NOT NULL DEFAULT 0,
      verified INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'published', created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_places_status ON places(status);
    CREATE INDEX IF NOT EXISTS idx_places_category ON places(category_slug);
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY, ref TEXT UNIQUE NOT NULL, user_id TEXT NOT NULL, place_id TEXT NOT NULL,
      date TEXT NOT NULL, time TEXT NOT NULL, guests INTEGER NOT NULL, price INTEGER NOT NULL,
      method TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'confirmed', created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, place_id TEXT NOT NULL,
      author_name TEXT NOT NULL, rating INTEGER NOT NULL, comment TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_place ON reviews(place_id);
    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL, place_id TEXT NOT NULL, created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, place_id)
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL,
      title TEXT NOT NULL, body TEXT NOT NULL, place_id TEXT,
      read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read);

    CREATE TABLE IF NOT EXISTS visits (
      user_id TEXT NOT NULL,
      place_id TEXT NOT NULL,
      visited_at TEXT NOT NULL,
      reminded INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, place_id)
    );
    CREATE INDEX IF NOT EXISTS idx_visits_user ON visits(user_id, reminded);

    -- Hamyon tranzaksiyalari (biznes egalari uchun virtual balans)
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,             -- 'booking_in' | 'withdrawal' | 'adjustment' | 'commission'
      amount INTEGER NOT NULL,         -- musbat (kirim) yoki manfiy (chiqim) — soʻm
      balance_after INTEGER NOT NULL,
      reference_id TEXT,               -- booking_id yoki withdrawal_id
      note TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_transactions(user_id, created_at);

    -- Bog'langan kartalar (yechib olish uchun)
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      last4 TEXT NOT NULL,             -- karta raqamining oxirgi 4 raqami
      holder TEXT NOT NULL,
      brand TEXT,                      -- 'humo' | 'uzcard' | 'visa' | 'mastercard'
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(user_id);

    -- Pul yechish so'rovlari
    CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      card_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
      admin_note TEXT,
      created_at TEXT NOT NULL,
      processed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id, created_at);
    CREATE TABLE IF NOT EXISTS otps (
      phone TEXT PRIMARY KEY, code TEXT NOT NULL, expires_at TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0
    );
  `);
}

function seedIfEmpty(d: SqlJsDatabase) {
  // Admin foydalanuvchisi mavjudligini tekshiramiz; joylar boshlang'ich qo'shilmaydi
  const ures = d.exec("SELECT COUNT(*) as n FROM users WHERE id = 'admin'");
  const un = ures[0]?.values?.[0]?.[0] as number;
  if (un && un > 0) return;

  const now = new Date().toISOString();
  const insertUser = d.prepare('INSERT INTO users (id, phone, provider, name, role, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertUser.run(['admin', '+998000000000', 'phone', 'Admin', 'business', 1, now]);
  insertUser.free();
}
