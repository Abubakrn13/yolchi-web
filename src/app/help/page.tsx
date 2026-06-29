'use client';
import InfoBack from '@/components/InfoBack';
import { useT } from '@/lib/i18n';
import InfoHeader from '@/components/InfoHeader';

export default function HelpPage() {
  const { t } = useT();
  return (
    <>
      <InfoHeader />
      <main className="info-page">
        <InfoBack />
        <h1>{t.info.helpTitle}</h1>
        <p className="info-lead">{t.info.helpLead}</p>
        {t.faq.map((f, i) => (
          <div key={i} className="faq-item">
            <div className="faq-q">{f.q}</div>
            <div className="faq-a">{f.a}</div>
          </div>
        ))}
      </main>
    </>
  );
}
