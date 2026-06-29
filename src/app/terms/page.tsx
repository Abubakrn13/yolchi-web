'use client';
import InfoBack from '@/components/InfoBack';
import { useT } from '@/lib/i18n';
import InfoHeader from '@/components/InfoHeader';

export default function TermsPage() {
  const { t } = useT();
  return (
    <>
      <InfoHeader />
      <main className="info-page">
        <InfoBack />
        <h1>{t.info.termsTitle}</h1>
        <p className="info-lead">{t.info.termsLead}</p>
        <p>{t.info.termsP1}</p>
        <p>{t.info.termsP2}</p>
      </main>
    </>
  );
}
