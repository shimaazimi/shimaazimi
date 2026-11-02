'use client';

import { useEffect, useRef } from 'react';

// The site's own numbers, shown live: a performance engineer's portfolio should prove it.
export default function PerfReadout() {
  const fps = useRef<HTMLElement>(null);
  const lcp = useRef<HTMLElement>(null);
  const cls = useRef<HTMLElement>(null);

  useEffect(() => {
    let frames = 0, last = performance.now(), raf = 0;
    const loop = (now: number) => {
      frames++;
      if (now - last > 800) {
        if (fps.current) fps.current.textContent = String(Math.round(frames * 1000 / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const observers: PerformanceObserver[] = [];
    try {
      const l = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const entry = entries[entries.length - 1];
        if (entry && lcp.current) lcp.current.textContent = `${(entry.startTime / 1000).toFixed(2)}s`;
      });
      l.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(l);
      // Page load is over once the visitor scrolls; later reveals are not load time
      addEventListener('scroll', () => l.disconnect(), { once: true, passive: true });

      let shift = 0;
      const c = new PerformanceObserver(list => {
        for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!e.hadRecentInput) shift += e.value;
        }
        if (cls.current) cls.current.textContent = shift.toFixed(3);
      });
      c.observe({ type: 'layout-shift', buffered: true });
      observers.push(c);
    } catch {}

    return () => {
      cancelAnimationFrame(raf);
      observers.forEach(o => o.disconnect());
    };
  }, []);

  return (
    <div className="perf" aria-hidden="true">
      <span>FPS <b ref={fps}>–</b></span>
      <span>LCP <b ref={lcp}>–</b></span>
      <span>CLS <b ref={cls}>0.000</b></span>
    </div>
  );
}
