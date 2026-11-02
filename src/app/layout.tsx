import type { Metadata, Viewport } from 'next';
import { Sora, Vazirmatn } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], weight: ['200', '300', '400', '600'], variable: '--font-latin', display: 'swap' });
const vazirmatn = Vazirmatn({ subsets: ['arabic', 'latin'], weight: ['200', '300', '400', '600'], variable: '--font-fa', display: 'swap' });

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
