'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Map as MapIcon, Heart, User } from 'lucide-react';
import { useT } from '@/lib/i18n';
import YolchiLogo from './YolchiLogo';

export default function AppNav() {
  const { t } = useT();
  const path = usePathname();
  const items = [
    { href: '/home', icon: Home, label: t.nav.home },
    { href: '/search', icon: Search, label: t.nav.search },
    { href: '/map', icon: MapIcon, label: t.nav.map },
    { href: '/favorites', icon: Heart, label: t.nav.favorites },
    { href: '/profile', icon: User, label: t.nav.profile },
  ];
  const active = (href: string) => path === href || (href !== '/home' && path.startsWith(href));

  return (
    <>
      <aside className="sidebar">
        <Link href="/home" className="sidebar__brand">
          <YolchiLogo size={30} /> <span>Yoʻlchi</span>
        </Link>
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href} className={`sidebar__link ${active(it.href) ? 'sidebar__link--active' : ''}`}>
              <Icon size={20} /> {it.label}
            </Link>
          );
        })}
      </aside>
      <nav className="bottom-nav">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href} className={`bottom-nav__link ${active(it.href) ? 'bottom-nav__link--active' : ''}`}>
              <Icon size={22} /> {it.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
