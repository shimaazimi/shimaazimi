'use client';

import { useEffect, useRef, useState } from 'react';
import type { Lang } from '@/content/content';
import { loadGsap, prefersReducedMotion } from '@/lib/gsap';

// Renders the final number without JavaScript, then counts up when it first comes into view.
export default function Counter({ value, suffix, lang }: { value: number; suffix: string; lang: Lang }) {
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    const el = ref.current;
    let cancelled = false;
    let cleanup = () => {};
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      loadGsap().then(({ gsap }) => {
        if (cancelled) return;
        const state = { v: 0 };
        const tween = gsap.to(state, {
          v: value, duration: 1.6, ease: 'power2.out',
          onUpdate: () => setShown(Math.round(state.v)),
        });
        cleanup = () => tween.kill();
      });
    }, { threshold: .4 });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); cleanup(); };
  }, [value]);

  const n = shown.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US');
  return <span ref={ref}>{n}{suffix && lang === 'fa' ? '٪' : suffix}</span>;
}
