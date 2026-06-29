'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/lib/store';
import YolchiLogo from './YolchiLogo';

export default function InfoHeader() {
  const { t } = useT();
  const user = useAuth((s) => s.user);
  const homeHref = user ? '/home' : '/';
  return (
    <header className="landing-header">
      <div className="container landing-header__inner">
        <Link href={homeHref} className="landing-header__brand"><YolchiLogo size={30} /> Yoʻlchi</Link>
        <Link href={homeHref} className="btn" style={{ padding: '9px 16px' }}>{t.nav.home}</Link>
      </div>
    </header>
  );
}
