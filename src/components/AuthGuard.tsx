'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace('/auth');
    else if (!user.role) router.replace('/onboarding');
  }, [ready, user, router]);

  if (!ready || !user || !user.role) {
    return <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', color: 'var(--text-2)' }}>…</div>;
  }
  return <>{children}</>;
}
