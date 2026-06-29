// Server bilan sinxron store: API'lardan ma'lumot oladi va keshlaydi.
import { create } from 'zustand';
import { api, type ServerUser, type ServerBooking, type ServerNotification } from './api';

export type Role = 'tourist' | 'business';
export type Provider = string;
export interface User extends ServerUser {}

interface AuthState {
  user: ServerUser | null;
  ready: boolean;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  setRole: (role: Role) => Promise<void>;
  updateProfile: (data: { name?: string; photo?: string | null }) => Promise<void>;
  setUser: (u: ServerUser | null) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  ready: false,
  load: async () => {
    if (get().ready) return;
    try { const { user } = await api.me(); set({ user, ready: true }); }
    catch { set({ user: null, ready: true }); }
  },
  refresh: async () => {
    try { const { user } = await api.me(); set({ user }); } catch { /* ignore */ }
  },
  signOut: async () => { try { await api.logout(); } catch {} set({ user: null }); },
  setRole: async (role) => { await api.setRole(role); await get().refresh(); },
  updateProfile: async (data) => { await api.updateProfile(data); await get().refresh(); },
  setUser: (u) => set({ user: u }),
}));

interface FavoritesState {
  ids: string[];
  ready: boolean;
  load: () => Promise<void>;
  toggle: (id: string) => Promise<void>;
}
export const useFavorites = create<FavoritesState>((set, get) => ({
  ids: [],
  ready: false,
  load: async () => {
    try { const { ids } = await api.listFavorites(); set({ ids, ready: true }); }
    catch { set({ ids: [], ready: true }); }
  },
  toggle: async (id) => {
    const cur = get().ids;
    const optimistic = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    set({ ids: optimistic });
    try { await api.toggleFavorite(id); }
    catch { set({ ids: cur }); }
  },
}));

interface BookingsState {
  items: ServerBooking[];
  ready: boolean;
  load: () => Promise<void>;
  cancel: (id: string) => Promise<void>;
  prepend: (b: ServerBooking) => void;
}
export const useBookings = create<BookingsState>((set, get) => ({
  items: [],
  ready: false,
  load: async () => {
    try { const { items } = await api.listBookings(); set({ items, ready: true }); }
    catch { set({ items: [], ready: true }); }
  },
  cancel: async (id) => {
    await api.cancelBooking(id);
    set({ items: get().items.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)) });
  },
  prepend: (b) => set({ items: [b, ...get().items] }),
}));

interface NotificationsState {
  items: ServerNotification[];
  ready: boolean;
  load: () => Promise<void>;
  markAllRead: () => Promise<void>;
  clear: () => Promise<void>;
}
export const useNotifications = create<NotificationsState>((set) => ({
  items: [],
  ready: false,
  load: async () => {
    try { const { items } = await api.listNotifications(); set({ items, ready: true }); }
    catch { set({ items: [], ready: true }); }
  },
  markAllRead: async () => { try { await api.markAllRead(); } catch {} set((s) => ({ items: s.items.map((x) => ({ ...x, read: true })) })); },
  clear: async () => { try { await api.clearNotifications(); } catch {} set({ items: [] }); },
}));

// Mavzu (localStorage'da qoladi - foydalanuvchi sozlamasi)
export type Theme = 'light' | 'dark';
interface ThemeState {
  theme: Theme;
  ready: boolean;
  load: () => void;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}
const persistTheme = (t: Theme) => { try { localStorage.setItem('yolchi-theme', t); } catch {} };
export const useTheme = create<ThemeState>((set, get) => ({
  theme: 'light',
  ready: false,
  load: () => {
    try {
      const v = localStorage.getItem('yolchi-theme');
      if (v === 'dark' || v === 'light') set({ theme: v, ready: true });
      else set({ ready: true });
    } catch { set({ ready: true }); }
  },
  toggle: () => { const t: Theme = get().theme === 'light' ? 'dark' : 'light'; set({ theme: t }); persistTheme(t); },
  setTheme: (t) => { set({ theme: t }); persistTheme(t); },
}));

// Toast (faqat brauzerda)
export type ToastVariant = 'success' | 'info' | 'error';
export interface Toast { id: string; message: string; variant: ToastVariant }
interface ToastsState {
  items: Toast[];
  push: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}
export const useToasts = create<ToastsState>((set) => ({
  items: [],
  push: (message, variant = 'success') =>
    set((s) => ({ items: [...s.items, { id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, message, variant }] })),
  dismiss: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
}));
