import { ensureDb, type DbWrapper } from './db';

export interface DbPlace {
  id: string; owner_id: string | null; name: string; description: string;
  category_slug: string; city: string | null; address: string | null; phone: string | null;
  lat: number; lng: number; photos: string; menu: string | null; working_hours: string | null;
  booking_price: number | null; is_bookable: number; price_level: number;
  rating_avg: number; rating_count: number; verified: number; status: string; created_at: string;
}

export interface PlaceDTO {
  id: string; ownerId: string | null; name: string; description: string;
  categorySlug: string; categoryName: string; city: string; address: string; phone?: string;
  location: { lat: number; lng: number };
  photos: string[]; menu?: string[]; workingHours?: string;
  bookingPrice?: number; isBookable: boolean; priceLevel: number;
  ratingAvg: number; ratingCount: number; verified: boolean; status: string;
}

const CAT_NAMES: Record<string, string> = {
  hotel: 'Mehmonxona', restaurant: 'Restoran', shop: "Doʻkon", pharmacy: 'Dorixona', attraction: 'Diqqatga sazovor',
};

export function rowToPlace(r: DbPlace): PlaceDTO {
  return {
    id: r.id, ownerId: r.owner_id, name: r.name, description: r.description,
    categorySlug: r.category_slug, categoryName: CAT_NAMES[r.category_slug] || r.category_slug,
    city: r.city || '', address: r.address || '', phone: r.phone || undefined,
    location: { lat: r.lat, lng: r.lng },
    photos: safeJson<string[]>(r.photos, []),
    menu: r.menu ? safeJson<string[] | undefined>(r.menu, undefined) : undefined,
    workingHours: r.working_hours || undefined,
    bookingPrice: r.booking_price ?? undefined,
    isBookable: !!r.is_bookable, priceLevel: r.price_level,
    ratingAvg: r.rating_avg, ratingCount: r.rating_count,
    verified: !!r.verified, status: r.status,
  };
}
function safeJson<T>(s: string, fallback: T): T { try { return JSON.parse(s) as T; } catch { return fallback; } }

export function listPlaces(db: DbWrapper, opts: { ownerId?: string; status?: string } = {}): PlaceDTO[] {
  const conds: string[] = [];
  const args: any[] = [];
  if (opts.ownerId) { conds.push('owner_id = ?'); args.push(opts.ownerId); }
  if (opts.status) { conds.push('status = ?'); args.push(opts.status); }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  const rows = db.prepare(`SELECT * FROM places ${where} ORDER BY created_at DESC`).all(...args) as DbPlace[];
  return rows.map(rowToPlace);
}

export function getPlace(db: DbWrapper, id: string): PlaceDTO | null {
  const r = db.prepare('SELECT * FROM places WHERE id = ?').get(id) as DbPlace | undefined;
  return r ? rowToPlace(r) : null;
}

export function recomputeRating(db: DbWrapper, placeId: string) {
  const row = db.prepare('SELECT COUNT(*) as n, AVG(rating) as avg FROM reviews WHERE place_id = ?').get(placeId) as { n: number; avg: number | null };
  const avg = row.avg ?? 0;
  db.prepare('UPDATE places SET rating_avg = ?, rating_count = ? WHERE id = ?').run(Math.round(avg * 10) / 10, row.n, placeId);
}
