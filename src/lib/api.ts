// Brauzer tomonidan ishlatiladigan API wrapper.
// Hamma so'rovlar cookie bilan ketadi (credentials: 'include').
async function call<T = any>(path: string, init?: RequestInit & { json?: any }): Promise<T> {
  const headers: Record<string, string> = { ...(init?.headers as any) };
  let body = init?.body;
  if (init?.json !== undefined) {
    headers['content-type'] = 'application/json';
    body = JSON.stringify(init.json);
  }
  const res = await fetch(path, { ...init, body, headers, credentials: 'include', cache: 'no-store' });
  let data: any = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  // auth
  requestOtp: (phone: string) => call('/api/auth/request-otp', { method: 'POST', json: { phone } }),
  verifyOtp: (phone: string, code: string) => call<{ user: ServerUser }>('/api/auth/verify-otp', { method: 'POST', json: { phone, code } }),
  googleSignIn: () => call<{ user: ServerUser }>('/api/auth/google', { method: 'POST' }),
  me: () => call<{ user: ServerUser | null }>('/api/auth/me'),
  setRole: (role: 'tourist' | 'business') => call('/api/auth/role', { method: 'POST', json: { role } }),
  updateProfile: (data: { name?: string; photo?: string | null }) => call('/api/auth/profile', { method: 'PATCH', json: data }),
  logout: () => call('/api/auth/logout', { method: 'POST' }),

  // places
  listPlaces: () => call<{ places: ServerPlace[] }>('/api/places'),
  myPlaces: () => call<{ places: ServerPlace[] }>('/api/places?mine=1'),
  getPlace: (id: string) => call<{ place: ServerPlace; reviews: ServerReview[] }>(`/api/places/${id}`),
  createPlace: (data: NewPlaceInput) =>
    call<{ place: ServerPlace; payment: { method: string; amount: number; debited: boolean } }>('/api/places', { method: 'POST', json: data }),
  deletePlace: (id: string) => call(`/api/places/${id}`, { method: 'DELETE' }),

  // reviews
  createReview: (placeId: string, rating: number, comment: string) =>
    call<{ review: ServerReview; rating: { ratingAvg: number; ratingCount: number } | null }>('/api/reviews', { method: 'POST', json: { placeId, rating, comment } }),

  // favorites
  listFavorites: () => call<{ ids: string[] }>('/api/favorites'),
  toggleFavorite: (placeId: string) => call<{ favorite: boolean }>('/api/favorites', { method: 'POST', json: { placeId } }),

  // bookings
  listBookings: () => call<{ items: ServerBooking[] }>('/api/bookings'),
  createBooking: (data: { placeId: string; date: string; time: string; guests: number; method: 'payme' | 'click' }) =>
    call<{ booking: ServerBooking & { subtotal: number; tax: number; total: number } }>('/api/bookings', { method: 'POST', json: data }),
  cancelBooking: (id: string) => call(`/api/bookings/${id}/cancel`, { method: 'POST' }),

  // notifications
  listNotifications: () => call<{ items: ServerNotification[] }>('/api/notifications'),
  markAllRead: () => call('/api/notifications/read-all', { method: 'POST' }),
  clearNotifications: () => call('/api/notifications/clear', { method: 'POST' }),

  // uploads
  uploadPhotos: async (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return call<{ urls: string[] }>('/api/uploads', { method: 'POST', body: fd });
  },

  // visits
  markVisit: (placeId: string) => call('/api/visits', { method: 'POST', json: { placeId } }),
  checkReminders: () => call<{ created: number }>('/api/visits/check', { method: 'POST' }),

  // wallet
  getWallet: () => call<{
    balance: number;
    transactions: WalletTx[];
    stats: { last7: number; last30: number; totalEarned: number };
    commissionRate: number;
  }>('/api/wallet'),

  // cards
  listCards: () => call<{ cards: ServerCard[] }>('/api/cards'),
  addCard: (data: { number: string; holder: string; expiry?: string }) =>
    call<{ card: ServerCard }>('/api/cards', { method: 'POST', json: data }),
  deleteCard: (id: string) => call(`/api/cards/${id}`, { method: 'DELETE' }),

  // withdrawals
  listWithdrawals: () => call<{ items: ServerWithdrawal[] }>('/api/withdrawals'),
  requestWithdrawal: (cardId: string, amount: number) =>
    call<{ withdrawal: ServerWithdrawal }>('/api/withdrawals', { method: 'POST', json: { cardId, amount } }),
  cancelWithdrawal: (id: string) => call(`/api/withdrawals/${id}`, { method: 'DELETE' }),

  // admin
  adminPending: () => call<{ places: ServerPlace[] }>('/api/admin/places?status=pending'),
  adminVerify: (id: string, action: 'approve' | 'reject') =>
    call(`/api/admin/places/${id}/verify`, { method: 'POST', json: { action } }),
  adminStats: () => call<{ stats: AdminStats; topOwners: AdminTopOwner[] }>('/api/admin/stats'),
  adminWithdrawals: (status: string = 'pending') =>
    call<{ items: AdminWithdrawalItem[] }>(`/api/admin/withdrawals?status=${status}`),
  adminApproveWithdrawal: (id: string) => call(`/api/withdrawals/${id}/approve`, { method: 'POST' }),
  adminRejectWithdrawal: (id: string, note?: string) =>
    call(`/api/withdrawals/${id}/reject`, { method: 'POST', json: { note: note || '' } }),
};

export interface ServerUser {
  id: string; phone: string; provider: string;
  name: string; photo: string | null;
  role: 'tourist' | 'business' | null;
  isAdmin: boolean;
}
export interface ServerPlace {
  id: string; ownerId: string | null; name: string; description: string;
  categorySlug: string; categoryName: string; city: string; address: string; phone?: string;
  location: { lat: number; lng: number };
  photos: string[]; menu?: string[]; workingHours?: string;
  bookingPrice?: number; isBookable: boolean; priceLevel: number;
  ratingAvg: number; ratingCount: number; verified: boolean; status: string;
}
export interface ServerReview {
  id: string; userId?: string; authorName: string; rating: number; comment: string; createdAt: string;
}
export interface ServerBooking {
  id: string; ref: string; placeId: string; placeName: string; city: string;
  date: string; time: string; guests: number; price: number;
  method: 'payme' | 'click'; status: 'confirmed' | 'cancelled'; createdAt: string;
  placePhoto?: string | null;
}
export interface ServerNotification {
  id: string; type: 'booking' | 'place' | 'system' | 'review_reminder';
  title: string; body: string; placeId?: string | null; read: boolean; createdAt: string;
}
export interface WalletTx {
  id: string; userId: string;
  type: 'booking_in' | 'withdrawal' | 'adjustment' | 'commission';
  amount: number; balanceAfter: number;
  referenceId: string | null; note: string | null; createdAt: string;
}
export interface ServerCard {
  id: string; last4: string; holder: string; brand: string | null;
  isDefault: boolean; createdAt: string;
}
export interface ServerWithdrawal {
  id: string; cardId: string; amount: number;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string | null; createdAt: string; processedAt: string | null;
  cardLast4: string | null; cardBrand: string | null;
}
export interface AdminStats {
  usersTotal: number; placesTotal: number; placesPending: number;
  bookingsTotal: number; gross: number; ownerPaid: number; withdrawn: number;
  platformRevenue: number; listingRevenue: number; totalPlatformRevenue: number;
  pendingWithdrawals: number; commissionRate: number;
}
export interface AdminTopOwner { id: string; phone: string; name: string; earned: number; }
export interface AdminWithdrawalItem {
  id: string; userId: string; userPhone: string; userName: string;
  cardLast4: string | null; cardBrand: string | null; cardHolder: string | null;
  amount: number; status: string; adminNote: string | null;
  createdAt: string; processedAt: string | null;
}

export interface NewPlaceInput {
  name: string; description: string; categorySlug: string;
  city?: string; address?: string; phone?: string;
  location: { lat: number; lng: number };
  photos: string[]; menu?: string[]; workingHours?: string;
  bookingPrice?: number; priceLevel?: number;
  paymentMethod: 'wallet' | 'payme' | 'click';
}
