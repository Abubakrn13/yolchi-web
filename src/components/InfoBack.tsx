'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/lib/store';

export default function InfoBack() {
  const { t } = useT();
  const user = useAuth((s) => s.user);
  const href = user ? '/profile/settings' : '/';
  return <Link href={href} className="info-back"><ArrowLeft size={15} /> {t.info.back}</Link>;
}
