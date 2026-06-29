import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap', weight: ['400', '500', '600', '700', '900'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  title: "Yoʻlchi — Oʻzbekiston boʻylab sayohat va joy topish",
  description: 'Mehmonxona, restoran, doʻkon va dorixonalarni toping, baholang, bron qiling va marshrut bilan yeting.',
};

const themeScript = `(function(){try{var t=JSON.parse(localStorage.getItem('yolchi-theme')||'{}');if(t&&t.state&&t.state.theme==='dark'){document.documentElement.setAttribute('data-theme','dark');}var l=localStorage.getItem('yolchi-lang');if(l){document.documentElement.lang=l;}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
