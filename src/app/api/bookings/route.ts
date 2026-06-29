import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';
import { genId, genRef } from '@/server/ids';
import { getPlace } from '@/server/places';
import { distributeBookingPayment } from '@/server/wallet';

export const runtime = 'nodejs';
const TAX_RATE = 0.03;

export async function GET(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const rows = db.prepare(`SELECT b.*, p.name as place_name, p.city as place_city, p.photos as place_photos
      FROM bookings b JOIN places p ON p.id = b.place_id
      WHERE b.user_id = ? ORDER BY b.created_at DESC`).all(u.id) as any[];
    const items = rows.map((r) => ({
      id: r.id, ref: r.ref, placeId: r.place_id, placeName: r.place_name, city: r.place_city || '',
      date: r.date, time: r.time, guests: r.guests, price: r.price, method: r.method, status: r.status, createdAt: r.created_at,
      placePhoto: safeFirst(r.place_photos),
    }));
    return { items };
  });
}

function safeFirst(s: string): string | null { try { const a = JSON.parse(s); return Array.isArray(a) && a[0] ? a[0] : null; } catch { return null; } }

export async function POST(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const { placeId, date, time, guests, method } = await req.json();
    if (!placeId || !date || !time || !guests || !method) throw new HttpError(400, 'Missing fields');
    if (method !== 'payme' && method !== 'click') throw new HttpError(400, 'Invalid method');
    const place = getPlace(db, placeId);
    if (!place) throw new HttpError(404, 'Place not found');
    if (!place.isBookable) throw new HttpError(400, 'Place is not bookable');

    const base = place.bookingPrice ?? 0;
    const tax = Math.round(base * TAX_RATE);
    const total = base + tax;

    const id = genId('b');
    const ref = genRef();
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO bookings (id, ref, user_id, place_id, date, time, guests, price, method, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)`).run(id, ref, u.id, placeId, date, time, Math.max(1, Number(guests)), total, method, now);
    db.prepare('INSERT INTO notifications (id, user_id, type, title, body, place_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      genId('n'), u.id, 'booking', 'Bron tasdiqlandi', `${place.name} · ${ref}`, placeId, now);

    // Bron qilingan joyni "visit" sifatida ham belgilash — keyinroq baholash eslatmasi tushishi uchun
    if (place.ownerId !== u.id) {
      db.prepare(`INSERT INTO visits (user_id, place_id, visited_at, reminded) VALUES (?, ?, ?, 0)
                  ON CONFLICT(user_id, place_id) DO UPDATE SET visited_at = excluded.visited_at, reminded = 0`)
        .run(u.id, placeId, now);
    }

    // Biznes egasining hamyoniga pul tushiramiz (komissiya ushlab)
    let ownerCredit = 0;
    if (place.ownerId) {
      const r = distributeBookingPayment(db, id, place.ownerId, base);
      ownerCredit = r.ownerCredit;
      // Biznes egasiga ham xabar
      db.prepare('INSERT INTO notifications (id, user_id, type, title, body, place_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        genId('n'), place.ownerId, 'booking', 'Yangi bron!',
        `${place.name} · ${date} ${time} · ${Math.max(1, Number(guests))} mehmon · ${ownerCredit.toLocaleString('en-US').replace(/,/g, ' ')} soʻm`,
        placeId, now);
    }

    return { booking: { id, ref, placeId, placeName: place.name, city: place.city, date, time, guests: Math.max(1, Number(guests)), price: total, method, status: 'confirmed', createdAt: now, subtotal: base, tax, total, ownerCredit } };
  });
}
