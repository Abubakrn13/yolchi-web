import type { ServerPlace, ServerReview } from './api';

export type CategorySlug = 'hotel' | 'restaurant' | 'shop' | 'pharmacy' | 'attraction';

export interface Coordinates { lat: number; lng: number }

// Server'dan keladigan Place ni ishlatamiz (alias)
export type Place = ServerPlace;
export type Review = ServerReview;
