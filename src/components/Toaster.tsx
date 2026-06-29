'use client';

import { useEffect } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useToasts } from '@/lib/store';

export default function Toaster() {
  const items = useToasts((s) => s.items);
  const dismiss = useToasts((s) => s.dismiss);

  useEffect(() => {
    if (items.length === 0) return;
    const timers = items.map((t) => setTimeout(() => dismiss(t.id), 3000));
    return () => timers.forEach(clearTimeout);
  }, [items, dismiss]);

  if (items.length === 0) return null;
  return (
    <div className="toaster">
      {items.map((t) => (
        <div key={t.id} className={`toast toast--${t.variant}`} onClick={() => dismiss(t.id)}>
          {t.variant === 'success' ? <CheckCircle2 size={18} /> : t.variant === 'error' ? <XCircle size={18} /> : <Info size={18} />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
