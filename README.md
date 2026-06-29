# Yoʻlchi — Travel & business platform (Uzbekistan / CIS)

To'liq backend bilan ishlaydigan platforma: Next.js 14 + TypeScript + SQLite (sql.js) + JWT.
**Windows'da C++ kompilyator kerak emas.**

## Asosiy funksiyalar

- **Sayyohlar uchun:** joy qidirish, bron, sharh, sevimlilar, marshrut, geolokatsiya
- **Biznes egalari uchun:** joy qoʻshish, **virtual hamyon**, daromad statistikasi, karta ulash, **pul yechish**
- **Admin uchun:** joylarni tasdiqlash, yechimlarni tasdiqlash, umumiy statistika
- **Avtomatik:** baholash eslatmasi, bildirishnomalar, 3% xizmat haqi, 5% biznes komissiya

## Ishga tushirish (Windows / Mac / Linux)

```bash
cd yolchi-web
cp .env.example .env.local   # JWT_SECRET ni almashtiring
npm install
npm run dev                  # http://localhost:3000
```

## Demo kirish

- Sayyoh / Biznes: har qanday telefon + kod **`123456`**
- Admin: `+998000000000` + kod `123456` → profilda **Admin** tugmasi

## Pul oqimi

1. Mijoz bron qiladi → joy narxi + 3% xizmat haqi toʻlaydi
2. Biznes egasining **virtual hamyoniga** joy narxining 95% tushadi (5% Yoʻlchi komissiyasi)
3. Biznes egasi kartani ulaydi → **pul yechish soʻrovi** yuboradi (min 10 000 soʻm)
4. Admin yechishni tasdiqlaydi → balans kamayadi
5. Admin paneli umumiy aylanma va Yoʻlchi daromadini koʻradi

## Hosting (saytni internetga chiqarish)

Sayt **server kerak** (Node.js + disk). Statik host (GitHub Pages) ishlamaydi.

### Tavsiya etiladigan platformalar

| Platforma | Plus | Minus |
|-----------|------|-------|
| **Railway** ⭐ | Disk fayllari saqlanadi, SQLite ishlaydi, oson | $5/oy kredit, keyin pulli |
| **Render** | Persistent Disk, bepul plan | 15 daqiqa ishlatilmasa uxlaydi |
| **Fly.io** | Disk volumes, kuchli | Texnik biroz qiyinroq |
| **VPS** (DigitalOcean, Hetzner) | Toʻliq nazorat, $4-6/oy | Linux bilan ishlash kerak |
| **Vercel** | Eng oson, bepul | ⚠️ Disk fayllari saqlanmaydi — Postgres + S3 ga oʻtish kerak |

**Boshlash uchun:** Railway tavsiya etiladi. Production'da Postgres + S3 + real to'lov shlyuzi (Payme/Click).

## Texnologiyalar

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Zustand
- **Backend:** Next.js API routes, sql.js (SQLite WASM), JWT
- **Xarita:** Leaflet, OSRM (turn-by-turn marshrut)
- **i18n:** O'zbek / Rus / Ingliz

## Keyingi qadamlar

- Real SMS (Eskiz.uz)
- Real to'lov shlyuzi (Payme/Click merchant API)
- Real Google OAuth (`google-auth-library`)
- Postgres (Supabase/Neon)
- Cloud storage (S3) — uploadlar uchun
