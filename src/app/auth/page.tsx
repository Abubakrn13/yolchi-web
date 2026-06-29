'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone } from 'lucide-react';
import YolchiLogo from '@/components/YolchiLogo';
import { useT } from '@/lib/i18n';
import { useAuth, useToasts } from '@/lib/store';
import { api } from '@/lib/api';

export default function AuthPage() {
  const { t } = useT();
  const router = useRouter();
  const refresh = useAuth((s) => s.refresh);
  const setUser = useAuth((s) => s.setUser);
  const pushToast = useToasts((s) => s.push);

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const goAfter = (role: string | null) => router.replace(role ? '/home' : '/onboarding');

  const send = async () => {
    setError('');
    if (phone.trim().length < 7) { setError(t.auth.tooShort); return; }
    setLoading(true);
    try { await api.requestOtp(phone.trim()); setStep('code'); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const verify = async () => {
    setError('');
    setLoading(true);
    try {
      const { user } = await api.verifyOtp(phone.trim(), code.trim());
      setUser(user);
      await refresh();
      goAfter(user.role);
    } catch (e: any) { setError(e.message || t.auth.wrong); }
    finally { setLoading(false); }
  };

  const google = async () => {
    setLoading(true);
    try {
      const { user } = await api.googleSignIn();
      setUser(user);
      await refresh();
      goAfter(user.role);
    } catch (e: any) { pushToast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__head">
          <div className="auth-card__logo"><YolchiLogo size={52} /></div>
          <div className="auth-card__title">{t.auth.title}</div>
          <div className="auth-card__sub">{t.auth.subtitle}</div>
        </div>

        {step === 'code' && (
          <button className="auth-back" onClick={() => { setStep('phone'); setError(''); }}>
            <ArrowLeft size={14} /> {t.detail.back}
          </button>
        )}

        {step === 'phone' ? (
          <>
            <div className="field">
              <label>{t.auth.phone}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.auth.phonePlaceholder} autoFocus disabled={loading} />
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{error}</div>}
            <button className="btn btn--block" onClick={send} disabled={loading}><Phone size={16} /> {t.auth.sendCode}</button>
            <div className="auth-divider">{t.auth.or}</div>
            <button className="auth-google" onClick={google} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.19l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.7A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.29-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.97L3.97 7.3C4.68 5.18 6.66 3.58 9 3.58z"/></svg>
              {t.auth.google}
            </button>
            <div className="auth-demo">{t.auth.demo}</div>
          </>
        ) : (
          <>
            <div className="field">
              <label>{t.auth.code}</label>
              <input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t.auth.codePlaceholder} maxLength={6} autoFocus disabled={loading} />
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{error}</div>}
            <button className="btn btn--block" onClick={verify} disabled={loading}>{t.auth.verify}</button>
            <div className="auth-demo">{t.auth.demo}</div>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <Link href="/" style={{ color: 'var(--text-2)', fontSize: 13 }}>← Yoʻlchi</Link>
        </div>
      </div>
    </main>
  );
}
