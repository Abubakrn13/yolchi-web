'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/lib/store';

export default function AppHeader() {
  const items = useNotifications((s) => s.items);
  const ready = useNotifications((s) => s.ready);
  const unread = ready ? items.filter((n) => !n.read).length : 0;
  return (
    <div className="app-header">
      <Link href="/notifications" className="bell" aria-label="Notifications">
        <Bell size={20} />
        {unread > 0 && <span className="bell__badge">{unread > 9 ? '9+' : unread}</span>}
      </Link>
    </div>
  );
}
