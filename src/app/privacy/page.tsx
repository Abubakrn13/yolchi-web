'use client';
import InfoBack from '@/components/InfoBack';
import { useT } from '@/lib/i18n';
import InfoHeader from '@/components/InfoHeader';

export default function PrivacyPage() {
  const { t } = useT();
  return (
    <>
      <InfoHeader />
      <main className="info-page">
        <InfoBack />
        <h1>{t.info.privacyTitle}</h1>
        <p className="info-lead">{t.info.privacyLead}</p>
        <p>{t.info.privacyP1}</p>
        <p>{t.info.privacyP2}</p>
      </main>
    </>
  );
}
