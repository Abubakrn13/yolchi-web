'use client';

import { useEffect } from 'react';
import { useAuth, useFavorites, useNotifications, useBookings } from '@/lib/store';
import { api } from '@/lib/api';

export default function AuthBootstrap() {
  const loadAuth = useAuth((s) => s.load);
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);
  const loadFav = useFavorites((s) => s.load);
  const loadNotif = useNotifications((s) => s.load);
  const loadBook = useBookings((s) => s.load);

  useEffect(() => { loadAuth(); }, [loadAuth]);

  // Foydalanuvchi tizimda bo'lsa: ma'lumotlarni yuklash + reminder tekshirish
  useEffect(() => {
    if (!ready) return;
    if (!user) return;
    loadFav(); loadNotif(); loadBook();
    // Reminder tekshirish: birinchi sahifa yuklanganda, keyin har 30 soniyada
    let mounted = true;
    const check = async () => {
      try {
        const { created } = await api.checkReminders();
        if (mounted && created > 0) loadNotif();
      } catch { /* ignore */ }
    };
    // Kichik kechikish bilan, kirishdan keyin foydalanuvchi joyga kirib chiqishi vaqti uchun
    const t1 = setTimeout(check, 3000);
    const t2 = setInterval(check, 30000);
    return () => { mounted = false; clearTimeout(t1); clearInterval(t2); };
  }, [user, ready, loadFav, loadNotif, loadBook]);

  return null;
}
