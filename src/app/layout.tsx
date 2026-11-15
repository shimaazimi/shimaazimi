import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Shipped with the site, so neither the build nor Iranian visitors depend on Google Fonts
const sora = localFont({ src: './fonts/sora-latin-wght-normal.woff2', weight: '100 800', variable: '--font-latin', display: 'swap' });
// Only the Persian glyphs ship. Without a generated fallback face, Latin words in Persian text fall through to Sora.
const vazirmatn = localFont({ src: './fonts/vazirmatn-arabic-wght-normal.woff2', weight: '100 900', variable: '--font-fa', display: 'swap', adjustFontFallback: false });

export const metadata: Metadata = {
  title: 'Shima Azimi — Frontend Engineer',
  description: 'Portfolio of Shima Azimi, a frontend engineer working with React, React Native, Next.js and TypeScript.',
};

export const viewport: Viewport = {
  themeColor: '#050a16',
  colorScheme: 'dark',
};

// Runs before first paint. The timer keeps the page visible even if the app never hydrates.
const LANG_SCRIPT = `(function(){try{var s=localStorage.getItem('lang');var l=s||(/^fa/i.test(navigator.language)?'fa':'en');if(l==='fa'){var h=document.documentElement;h.lang='fa';h.dir='rtl';h.dataset.pending='fa';setTimeout(function(){delete h.dataset.pending},3000)}}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${sora.variable} ${vazirmatn.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
