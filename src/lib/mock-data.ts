// Faqat konstantalar va kategoriya ro'yxati (UI uchun).
// Joylar endi /api/places dan keladi (real baza).
export const HERO_IMAGE = 'https://images.unsplash.com/photo-1733586092622-1b3201e802a5?w=1100&q=80&auto=format&fit=crop';
export const LISTING_FEE = 30000;
export const BOOKING_TAX_RATE = 0.03;

export interface Category { id: string; slug: 'hotel'|'restaurant'|'shop'|'pharmacy'|'attraction'; name: string }
export const CATEGORIES: Category[] = [
  { id: 'c1', slug: 'hotel', name: 'Mehmonxona' },
  { id: 'c2', slug: 'restaurant', name: 'Restoran' },
  { id: 'c3', slug: 'shop', name: "Doʻkon" },
  { id: 'c4', slug: 'pharmacy', name: 'Dorixona' },
  { id: 'c5', slug: 'attraction', name: 'Diqqatga sazovor' },
];
