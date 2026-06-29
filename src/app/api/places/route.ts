import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';
import { listPlaces, getPlace } from '@/server/places';
import { genId } from '@/server/ids';
import { addTransaction, getBalance } from '@/server/wallet';

export const runtime = 'nodejs';

const LISTING_FEE = 30000; // soʻm

export async function GET(req: NextRequest) {
  return handle(async (db) => {
    const url = new URL(req.url);
    const mine = url.searchParams.get('mine') === '1';
    if (mine) {
      const u = await requireUser(req);
      return { places: listPlaces(db, { ownerId: u.id }) };
    }
    return { places: listPlaces(db, { status: 'published' }) };
  });
}

export async function POST(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    if (u.role !== 'business' && !u.is_admin) throw new HttpError(403, 'Only business owners can add places');
    const b = await req.json();
    if (!b.name || !b.location || typeof b.location.lat !== 'number' || typeof b.location.lng !== 'number') throw new HttpError(400, 'Name and location required');
    if (!b.categorySlug || !['hotel','restaurant','shop','pharmacy','attraction'].includes(b.categorySlug)) throw new HttpError(400, 'Invalid category');
    if (!b.city || !b.phone) throw new HttpError(400, 'City and phone required');

    // To'lov usulini tekshirish
    const paymentMethod = b.paymentMethod;
    if (!paymentMethod || !['wallet', 'payme', 'click'].includes(paymentMethod)) {
      throw new HttpError(400, 'paymentMethod required (wallet, payme, click)');
    }

    // Admin uchun bepul, qolganlari toʻlaydi
    const requiresPayment = !u.is_admin;
    let walletDebited = false;

    if (requiresPayment) {
      if (paymentMethod === 'wallet') {
        const balance = getBalance(db, u.id);
        if (balance < LISTING_FEE) {
          throw new HttpError(402, `Hamyonda yetarli mablagʻ yoʻq. Kerak: ${LISTING_FEE.toLocaleString('en-US').replace(/,/g, ' ')} soʻm, mavjud: ${balance.toLocaleString('en-US').replace(/,/g, ' ')} soʻm`);
        }
        // Hamyondan ushlab qolamiz
        walletDebited = true;
      }
      // Payme/Click — demo rejimida darhol 'muvaffaqiyatli' deb hisoblaymiz
      // Production'da bu yerda merchant API chaqiriladi va invoice yaratiladi.
    }

    const id = genId('p');
    const now = new Date().toISOString();
    const photos: string[] = Array.isArray(b.photos) ? b.photos.slice(0, 10) : [];
    const menu: string[] | null = Array.isArray(b.menu) && b.menu.length ? b.menu.map(String).slice(0, 30) : null;
    const price = b.bookingPrice ? Math.max(0, Math.floor(Number(b.bookingPrice))) : null;
    const isBookable = price ? 1 : 0;

    db.prepare(`INSERT INTO places
      (id, owner_id, name, description, category_slug, city, address, phone, lat, lng, photos, menu, working_hours, booking_price, is_bookable, price_level, rating_avg, rating_count, verified, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 'pending', ?)`)
      .run(id, u.id, String(b.name).slice(0, 120), String(b.description || '').slice(0, 500), b.categorySlug,
        b.city || null, b.address || null, b.phone || null, b.location.lat, b.location.lng,
        JSON.stringify(photos), menu ? JSON.stringify(menu) : null, b.workingHours || null,
        price, isBookable, Math.max(1, Math.min(4, Number(b.priceLevel || 2))), now);

    // Hamyondan ushlab qolish (joy yaratilgandan keyin — agar yaratilish xatosi bo'lsa pul ham olinmaydi)
    if (walletDebited) {
      addTransaction(db, u.id, 'withdrawal', -LISTING_FEE, {
        referenceId: id,
        note: `Joy eʼlon haqi: ${String(b.name).slice(0, 60)}`,
      });
    }

    return {
      place: getPlace(db, id),
      payment: { method: paymentMethod, amount: requiresPayment ? LISTING_FEE : 0, debited: walletDebited },
    };
  });
}
