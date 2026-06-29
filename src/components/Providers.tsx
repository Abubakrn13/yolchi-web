'use client';

import { LanguageProvider } from '@/lib/i18n';
import ThemeApplier from './ThemeApplier';
import AuthBootstrap from './AuthBootstrap';
import Toaster from './Toaster';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeApplier />
      <AuthBootstrap />
      {children}
      <Toaster />
    </LanguageProvider>
  );
}
