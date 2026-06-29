'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Store } from 'lucide-react';
import YolchiLogo from '@/components/YolchiLogo';
import { useT } from '@/lib/i18n';
import { useAuth, type Role, useToasts } from '@/lib/store';

export default function Onboarding() {
  const { t } = useT();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);
  const setRole = useAuth((s) => s.setRole);
  const pushToast = useToasts((s) => s.push);
  const [role, setRoleSel] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (ready && !user) router.replace('/auth'); }, [ready, user, router]);

  const cont = async () => {
    if (!role) return;
    setLoading(true);
    try { await setRole(role); router.replace('/home'); }
    catch (e: any) { pushToast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <main className="onb">
      <div className="onb__card">
        <div className="onb__logo"><YolchiLogo size={48} /></div>
        <div className="onb__title">{t.onboarding.title}</div>
        <div className="onb__sub">{t.onboarding.subtitle}</div>

        <button className={`role-card ${role === 'tourist' ? 'role-card--active' : ''}`} onClick={() => setRoleSel('tourist')}>
          <div className="role-card__icon"><Plane size={24} /></div>
          <div><div className="role-card__title">{t.onboarding.tourist}</div><div className="role-card__desc">{t.onboarding.touristDesc}</div></div>
        </button>
        <button className={`role-card ${role === 'business' ? 'role-card--active' : ''}`} onClick={() => setRoleSel('business')}>
          <div className="role-card__icon"><Store size={24} /></div>
          <div><div className="role-card__title">{t.onboarding.business}</div><div className="role-card__desc">{t.onboarding.businessDesc}</div></div>
        </button>

        <button className="btn btn--block" onClick={cont} disabled={!role || loading} style={{ marginTop: 8 }}>{t.onboarding.cont}</button>
      </div>
    </main>
  );
}
