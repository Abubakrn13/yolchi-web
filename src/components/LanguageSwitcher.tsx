'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { LOCALES, LOCALE_NAMES, useT } from '@/lib/i18n';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  return (
    <div className="lang">
      <button className="lang__btn" onClick={() => setOpen((o) => !o)} aria-label="Language">
        <Globe size={16} /> {compact ? lang.toUpperCase() : LOCALE_NAMES[lang]}
      </button>
      {open && (
        <>
          <div className="lang__backdrop" onClick={() => setOpen(false)} />
          <div className="lang__menu">
            {LOCALES.map((l) => (
              <button
                key={l}
                className={`lang__item ${l === lang ? 'is-active' : ''}`}
                onClick={() => { setLang(l); setOpen(false); }}
              >
                {LOCALE_NAMES[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
