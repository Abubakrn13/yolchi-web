'use client';
import InfoBack from '@/components/InfoBack';
import { useT } from '@/lib/i18n';
import InfoHeader from '@/components/InfoHeader';

export default function AboutPage() {
  const { t } = useT();
  return (
    <>
      <InfoHeader />
      <main className="info-page">
        <InfoBack />
        <h1>{t.info.aboutTitle}</h1>
        <p className="info-lead">{t.info.aboutLead}</p>
        <p>{t.info.aboutP1}</p>
        <p>{t.info.aboutP2}</p>
      </main>
    </>
  );
}
