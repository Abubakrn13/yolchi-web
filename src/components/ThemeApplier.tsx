'use client';

import { useEffect } from 'react';
import { useTheme } from '@/lib/store';

export default function ThemeApplier() {
  const theme = useTheme((s) => s.theme);
  const ready = useTheme((s) => s.ready);
  const load = useTheme((s) => s.load);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, ready]);
  return null;
}
