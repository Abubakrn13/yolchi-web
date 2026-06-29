'use client';

import Link from 'next/link';
import { Compass, CalendarCheck, Route as RouteIcon, Star, BadgeCheck, ShieldCheck, Navigation, Sparkles, MapPin, Heart, TrendingUp, Users } from 'lucide-react';
import { useT } from '@/lib/i18n';
import YolchiLogo from '@/components/YolchiLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Landing() {
  const { t } = useT();

  const features = [
    { icon: Compass, title: t.landing.f1Title, desc: t.landing.f1Desc },
    { icon: CalendarCheck, title: t.landing.f2Title, desc: t.landing.f2Desc },
    { icon: RouteIcon, title: t.landing.f3Title, desc: t.landing.f3Desc },
    { icon: Star, title: t.landing.f4Title, desc: t.landing.f4Desc },
  ];
  const why = [
    { icon: BadgeCheck, title: t.trust.why1T, desc: t.trust.why1D },
    { icon: ShieldCheck, title: t.trust.why2T, desc: t.trust.why2D },
    { icon: Navigation, title: t.trust.why3T, desc: t.trust.why3D },
  ];

  return (
    <>
      <header className="landing-header">
        <div className="container landing-header__inner">
          <div className="landing-header__brand"><YolchiLogo size={32} /> Yoʻlchi</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LanguageSwitcher compact />
            <Link href="/auth" className="btn" style={{ padding: '9px 16px' }}>{t.landing.ctaStart}</Link>
          </div>
        </div>
      </header>

      {/* HERO — chiroyli gradient, floating elementlar */}
      <section className="hero-v2">
        <div className="hero-v2__bg" />
        <div className="hero-v2__pattern" />

        {/* Float pinlari */}
        <div className="hero-v2__float hero-v2__float--1"><MapPin size={20} /></div>
        <div className="hero-v2__float hero-v2__float--2"><Heart size={18} fill="currentColor" /></div>
        <div className="hero-v2__float hero-v2__float--3"><Star size={16} fill="currentColor" /></div>
        <div className="hero-v2__float hero-v2__float--4"><Sparkles size={20} /></div>

        <div className="hero-v2__inner container">
          <div className="hero-v2__badge"><Sparkles size={14} /> {t.landing.eyebrow}</div>
          <h1 className="hero-v2__title">
            {t.landing.titlePre} <br />
            <span className="hero-v2__accent">{t.landing.titleAccent}</span>
          </h1>
          <p className="hero-v2__sub">{t.landing.subtitle}</p>
          <div className="hero-v2__cta">
            <Link href="/auth" className="btn">{t.landing.ctaStart}</Link>
            <Link href="/auth" className="btn btn--ghost">{t.landing.ctaHasAccount}</Link>
          </div>

          {/* Statistika ribbon */}
          <div className="hero-v2__stats">
            <div className="stat-pill"><div className="stat-pill__num">5⭐</div><div className="stat-pill__lbl">{t.trust.why1T}</div></div>
            <div className="stat-pill"><div className="stat-pill__num">3%</div><div className="stat-pill__lbl">{t.landing.serviceFeeLabel}</div></div>
            <div className="stat-pill"><div className="stat-pill__num">24/7</div><div className="stat-pill__lbl">{t.trust.why3T}</div></div>
          </div>
        </div>
      </section>

      {/* Xususiyatlar — katta-katta kartochkalar */}
      <section className="landing-features">
        <div className="container">
          <div className="section-head">
            <div className="section-head__eyebrow">{t.landing.featuresEyebrow}</div>
            <h2 className="section-head__title">{t.landing.featuresTitle}</h2>
          </div>
          <div className="feature-grid">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="feature-card feature-card--v2">
                  <div className="feature-card__icon feature-card__icon--v2"><Icon size={26} /></div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nima uchun Yoʻlchi */}
      <section className="why-v2">
        <div className="container">
          <div className="section-head">
            <div className="section-head__eyebrow">{t.landing.whyEyebrow}</div>
            <h2 className="section-head__title">{t.trust.whyTitle}</h2>
          </div>
          <div className="why-grid">
            {why.map((w, i) => {
              const Icon = w.icon;
              return (
                <div key={i} className="why-card">
                  <div className="why-card__icon"><Icon size={28} /></div>
                  <div>
                    <h3>{w.title}</h3>
                    <p>{w.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Qanday ishlaydi - 3 qadam */}
      <section className="how-v2">
        <div className="container">
          <div className="section-head section-head--center">
            <div className="section-head__eyebrow">{t.landing.howEyebrow}</div>
            <h2 className="section-head__title">{t.landing.howTitle}</h2>
          </div>
          <div className="how-steps-v2">
            <div className="step-v2">
              <div className="step-v2__num">1</div>
              <div className="step-v2__icon"><Users size={28} /></div>
              <p>{t.landing.s1}</p>
            </div>
            <div className="step-v2__connector" />
            <div className="step-v2">
              <div className="step-v2__num">2</div>
              <div className="step-v2__icon"><MapPin size={28} /></div>
              <p>{t.landing.s2}</p>
            </div>
            <div className="step-v2__connector" />
            <div className="step-v2">
              <div className="step-v2__num">3</div>
              <div className="step-v2__icon"><CalendarCheck size={28} /></div>
              <p>{t.landing.s3}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Biznes egalari uchun bo'lim */}
      <section className="biz-v2">
        <div className="container">
          <div className="biz-v2__inner">
            <div className="biz-v2__text">
              <div className="section-head__eyebrow">{t.landing.bizEyebrow}</div>
              <h2 className="section-head__title">{t.landing.bizTitle}</h2>
              <p className="biz-v2__desc">{t.landing.bizDesc}</p>
              <ul className="biz-v2__list">
                <li><TrendingUp size={18} /> {t.landing.bizPoint1}</li>
                <li><BadgeCheck size={18} /> {t.landing.bizPoint2}</li>
                <li><ShieldCheck size={18} /> {t.landing.bizPoint3}</li>
              </ul>
              <Link href="/auth" className="btn" style={{ marginTop: 22 }}>{t.landing.ctaStart}</Link>
            </div>
            <div className="biz-v2__card">
              <div className="biz-v2__card-balance">
                <div className="biz-v2__card-lbl">Balans</div>
                <div className="biz-v2__card-amt">2 850 000 <span>soʻm</span></div>
              </div>
              <div className="biz-v2__card-rows">
                <div className="biz-v2__card-row">
                  <span>+ 95 000</span>
                  <span style={{ color: 'var(--text-2)' }}>Bron uchun toʻlov</span>
                </div>
                <div className="biz-v2__card-row">
                  <span>+ 120 000</span>
                  <span style={{ color: 'var(--text-2)' }}>Bron uchun toʻlov</span>
                </div>
                <div className="biz-v2__card-row">
                  <span style={{ color: 'var(--turq-d)' }}>+ 95 000</span>
                  <span style={{ color: 'var(--text-2)' }}>Bron uchun toʻlov</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* To'lov xavfsizligi */}
      <section className="secure-band">
        <div className="container">
          <h2>{t.trust.secureTitle}</h2>
          <p>{t.trust.secureDesc}</p>
          <div className="pay-badges">
            <span className="pay-badge">Payme</span>
            <span className="pay-badge">Click</span>
            <span className="pay-badge">VISA</span>
            <span className="pay-badge">Mastercard</span>
            <span className="pay-badge">HUMO</span>
            <span className="pay-badge">UZCARD</span>
          </div>
          <div style={{ marginTop: 26 }}><Link href="/auth" className="btn">{t.landing.ctaStart}</Link></div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-cols">
            <div className="footer-col">
              <div className="footer__brand"><YolchiLogo size={26} needle="#E7C079" /> Yoʻlchi</div>
              <p>{t.brandTagline}</p>
            </div>
            <div className="footer-col"><h4>{t.foot.product}</h4>
              <Link href="/auth">{t.landing.ctaStart}</Link>
              <Link href="/help">{t.foot.help}</Link>
            </div>
            <div className="footer-col"><h4>{t.foot.company}</h4>
              <Link href="/about">{t.foot.about}</Link>
              <Link href="/terms">{t.foot.terms}</Link>
              <Link href="/privacy">{t.foot.privacy}</Link>
            </div>
          </div>
          <div className="footer-bottom">© 2026 Yoʻlchi · {t.foot.rights}</div>
        </div>
      </footer>
    </>
  );
}
