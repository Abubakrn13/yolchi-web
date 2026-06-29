'use client';

import Link from 'next/link';
import { ArrowLeft, Globe, Moon, CalendarCheck, ChevronRight, HelpCircle, Info, FileText, Shield } from 'lucide-react';
import { useT, LOCALES } from '@/lib/i18n';
import { useTheme } from '@/lib/store';
import { useMounted } from '@/lib/useMounted';

export default function SettingsPage() {
  const { t, lang, setLang } = useT();
  const mounted = useMounted();
  const theme = useTheme((s) => s.theme);
  const setTheme = useTheme((s) => s.setTheme);
  const cur = mounted ? theme : 'light';

  return (
    <div className="container">
      <div className="app-topbar">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/profile" style={{ color: 'var(--text-2)', display: 'inline-flex' }}><ArrowLeft size={22} /></Link>
          {t.settings.title}
        </h1>
      </div>
      <div className="settings-card">
        <div className="settings-row">
          <span className="settings-row__label"><Globe size={18} /> {t.settings.language}</span>
          <div className="seg">
            {LOCALES.map((l) => (
              <button key={l} className={lang === l ? 'seg--on' : ''} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-row__label"><Moon size={18} /> {t.settings.theme}</span>
          <div className="seg">
            <button className={cur === 'light' ? 'seg--on' : ''} onClick={() => setTheme('light')}>{t.settings.light}</button>
            <button className={cur === 'dark' ? 'seg--on' : ''} onClick={() => setTheme('dark')}>{t.settings.dark}</button>
          </div>
        </div>
        <Link href="/profile/bookings" className="settings-row" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="settings-row__label"><CalendarCheck size={18} /> {t.settings.myBookings}</span>
          <ChevronRight size={18} style={{ color: 'var(--text-2)' }} />
        </Link>
      </div>

      <div className="settings-card" style={{ marginTop: 16 }}>
        <Link href="/help" className="settings-row" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="settings-row__label"><HelpCircle size={18} /> {t.foot.help}</span>
          <ChevronRight size={18} style={{ color: 'var(--text-2)' }} />
        </Link>
        <Link href="/about" className="settings-row" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="settings-row__label"><Info size={18} /> {t.foot.about}</span>
          <ChevronRight size={18} style={{ color: 'var(--text-2)' }} />
        </Link>
        <Link href="/terms" className="settings-row" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="settings-row__label"><FileText size={18} /> {t.foot.terms}</span>
          <ChevronRight size={18} style={{ color: 'var(--text-2)' }} />
        </Link>
        <Link href="/privacy" className="settings-row" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="settings-row__label"><Shield size={18} /> {t.foot.privacy}</span>
          <ChevronRight size={18} style={{ color: 'var(--text-2)' }} />
        </Link>
      </div>
    </div>
  );
}
