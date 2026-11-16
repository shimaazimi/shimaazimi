'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  about, articles, articlesIntro, contact, identity, journey, journeyIntro, projects, projectsIntro, services, skills, skillsIntro, ui,
  type Lang,
} from '@/content/content';
import { bus, STOPS } from '@/lib/bus';
import { loadGsap, prefersReducedMotion } from '@/lib/gsap';
import Counter from './Counter';
import PerfReadout from './PerfReadout';
import ProjectRequest from './ProjectRequest';

const IceScene = dynamic(() => import('./scene/IceScene'), { ssr: false });

const CRACKS = [
  'M0 38 L18 44 L30 36 L46 52 L58 47 L72 63 L100 58 M46 52 L42 76 L50 100 M30 36 L26 14 L34 0 M72 63 L84 86',
  'M100 22 L80 30 L68 24 L52 44 L38 40 L20 62 L0 66 M52 44 L58 70 L52 100 M68 24 L74 8 L70 0 M20 62 L30 84',
  'M12 0 L24 22 L18 38 L40 50 L36 70 L58 82 L64 100 M40 50 L64 42 L80 50 L100 44 M24 22 L46 18 L60 6',
];

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Portfolio() {
  const [lang, setLang] = useState<Lang>('en');
  const [scene, setScene] = useState<'pending' | 'on' | 'off'>('pending');
  const [carved, setCarved] = useState(true); // Copy stays visible until the 3D layer takes over
  const [openSkill, setOpenSkill] = useState(0);
  const progressRef = useRef<HTMLElement>(null);

  // Language: the visitor's own choice first, then the browser's. Storage may be unavailable.
  const [langReady, setLangReady] = useState(false);
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem('lang'); } catch {}
    if (saved === 'fa' || saved === 'en') setLang(saved);
    else if (/^fa/i.test(navigator.language)) setLang('fa');
    setLangReady(true);
  }, []);
  useEffect(() => {
    if (!langReady) return;
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'fa' ? 'rtl' : 'ltr';
    delete html.dataset.pending;
  }, [lang, langReady]);
  const switchLang = () => {
    const next = lang === 'en' ? 'fa' : 'en';
    setLang(next);
    try { localStorage.setItem('lang', next); } catch {}
  };

  // Content paints first; the 3D scene is only mounted once the browser is idle
  useEffect(() => {
    if (!hasWebGL()) {
      setScene('off');
      return;
    }
    setCarved(false);
    const safety = setTimeout(() => setCarved(true), 9000);
    const mount = () => setScene('on');
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(mount, { timeout: 1200 });
    else setTimeout(mount, 300);
    return () => clearTimeout(safety);
  }, []);

  // Scroll position drives the camera along the rink, measured against the real layout
  useEffect(() => {
    let tops: number[] = [];
    const measure = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      tops = [...document.querySelectorAll<HTMLElement>('[data-stop]')].map((el, i) => {
        if (i === 0) return 0;
        if (i === STOPS - 1) return max;
        const r = el.getBoundingClientRect();
        return Math.min(max, r.top + scrollY + r.height / 2 - innerHeight / 2);
      });
      onScroll();
    };
    const onScroll = () => {
      const y = scrollY;
      let s = 0;
      for (let i = 0; i < tops.length - 1; i++) {
        if (y >= tops[i]) s = i + Math.min(1, (y - tops[i]) / Math.max(1, tops[i + 1] - tops[i]));
      }
      bus.stop = s;
      bus.wake();
      const max = document.documentElement.scrollHeight - innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleY(${max > 0 ? y / max : 0})`;
    };
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', measure);
    measure();
    return () => {
      ro.disconnect();
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', measure);
    };
  }, []);

  // Sections rise into view as the blade reaches them
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cleanup = () => {};
    let cancelled = false;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('.reveal').forEach(el => {
          gsap.from(el, {
            y: 34, opacity: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });
      });
      cleanup = () => ctx.revert();
    });
    return () => { cancelled = true; cleanup(); };
  }, []);

  const replay = useCallback(() => {
    setCarved(false);
    bus.replayRequest++;
    bus.wake();
  }, []);
  const chooseSkill = (i: number) => {
    setOpenSkill(i);
    bus.skill = i;
    bus.wake();
  };
  const hoverProject = (i: number) => {
    bus.project = i;
    bus.wake();
  };

  return (
    <div className={scene === 'off' ? 'no-3d' : undefined}>
      {scene === 'off' ? <div className="scene-fallback" /> : null}
      {scene === 'on' ? <IceScene lang={lang} onCarved={() => setCarved(true)} /> : null}
      <div className="vignette" />

      <header className="top">
        <a className="mark" href="#top">{lang === 'fa' ? identity.name.fa : 'S—A'}</a>
        <nav aria-label={lang === 'fa' ? 'ناوبری اصلی' : 'Main'}>
          <a href="#about">{ui.nav.about[lang]}</a>
          <a href="#journey">{ui.nav.journey[lang]}</a>
          <a href="#work">{ui.nav.work[lang]}</a>
          <a href="#skills">{ui.nav.skills[lang]}</a>
          <a href="#services">{ui.nav.services[lang]}</a>
          {articles.length ? <a href="#writing">{ui.nav.writing[lang]}</a> : null}
          <a href="#contact">{ui.nav.contact[lang]}</a>
        </nav>
        <div className="controls">
          <button className="chip" type="button" onClick={switchLang} lang={lang === 'en' ? 'fa' : 'en'}>
            {ui.otherLang[lang]}
          </button>
        </div>
      </header>

      <div className="progress" aria-hidden="true"><i ref={progressRef} /></div>
      <PerfReadout />

      <main id="top">
        <section className="hero" data-stop>
          <div className={`intro${carved ? '' : ' hidden'}`}>
            <h1 className={scene === 'off' ? 'hero-title' : 'sr'} style={scene === 'off' ? { display: 'block' } : undefined}>
              {identity.name[lang]}
            </h1>
            <p className="role">{identity.role[lang]}</p>
            <p className="headline">{identity.headline[lang]}</p>
            <p className="tagline">{identity.tagline[lang]}</p>
            <p className="stack">{identity.stack}</p>
            <div className="hero-actions">
              <a className="chip primary" href="#work">{ui.seeWork[lang]}</a>
              <a className="chip" href="#request">{ui.startProject[lang]}</a>
              {scene === 'on' ? <button className="chip quiet" type="button" onClick={replay}>{ui.replay[lang]}</button> : null}
            </div>
          </div>
        </section>

        <section className="about" id="about" data-stop>
          <div className="about-grid">
            <div className="reveal">
              <p className="kicker">{about.kicker[lang]}</p>
              <h2 className="title">{about.title[lang]}</h2>
              <p className="body">{about.body[lang]}</p>
              <p className="skating">{about.skating[lang]}</p>
            </div>
            <ul className="stats">
              {about.stats.map(s => (
                <li className="panel stat reveal" key={s.label.en}>
                  <strong><Counter value={s.value} suffix={s.suffix} lang={lang} /></strong>
                  <span>{s.label[lang]}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div id="journey">
          <section className="journey-head">
            <p className="kicker">{journeyIntro.kicker[lang]}</p>
            <h2 className="title">{journeyIntro.title[lang]}</h2>
          </section>
          <ol style={{ listStyle: 'none', padding: 0 }}>
            {journey.map((j, i) => (
              <li key={j.company} style={{ display: 'contents' }}>
                <section className="stop" data-stop style={{ justifyContent: i % 2 ? 'flex-end' : 'flex-start' }}>
                  <article className="panel reveal">
                    <span className="num">{(i + 1).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')} / {journey.length.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span>
                    <h3>{j.company}</h3>
                    <p className="meta">{j.role[lang]} · {j.dates[lang]}</p>
                    <p className="sum">{j.summary[lang]}</p>
                  </article>
                </section>
              </li>
            ))}
          </ol>
        </div>

        <section className="projects" id="work" data-stop>
          <p className="kicker reveal">{projectsIntro.kicker[lang]}</p>
          <h2 className="title reveal">{projectsIntro.title[lang]}</h2>
          <ul className="project-list">
            {projects.map((p, i) => (
              <li
                className="panel project reveal"
                key={p.name}
                onPointerEnter={() => hoverProject(i)}
                onPointerLeave={() => hoverProject(-1)}
                onFocus={() => hoverProject(i)}
                onBlur={() => hoverProject(-1)}
              >
                <svg className="crack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d={CRACKS[i % CRACKS.length]} pathLength={1} />
                </svg>
                <h3>{p.name}</h3>
                <p>{p.summary[lang]}</p>
                {p.tools.length ? <ul className="tools">{p.tools.map(t => <li key={t}>{t}</li>)}</ul> : null}
                {p.url ? <a className="go" href={p.url} target="_blank" rel="noopener noreferrer">{ui.visit[lang]}<span className="sr"> {p.name}</span></a> : null}
              </li>
            ))}
          </ul>
        </section>

        {articles.length ? (
          <section className="writing" id="writing">
            <p className="kicker reveal">{articlesIntro.kicker[lang]}</p>
            <h2 className="title reveal">{articlesIntro.title[lang]}</h2>
            <ul className="article-list">
              {articles.map(a => (
                <li className="panel article reveal" key={a.url}>
                  <p className="meta">{a.source}{a.date ? ` · ${a.date}` : ''}</p>
                  <h3 lang={a.lang} dir={a.lang === 'fa' ? 'rtl' : 'ltr'}>{a.title}</h3>
                  {a.summary ? <p>{a.summary[lang]}</p> : null}
                  <a className="go" href={a.url} target="_blank" rel="noopener noreferrer">{articlesIntro.read[lang]}<span className="sr"> {a.title}</span></a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="skills" id="skills" data-stop>
          <div className="skills-col">
            <p className="kicker reveal">{skillsIntro.kicker[lang]}</p>
            <h2 className="title reveal">{skillsIntro.title[lang]}</h2>
            <ul className="skill-list reveal">
              {skills.map((s, i) => (
                <li className={`skill${openSkill === i ? ' open' : ''}`} key={s.name.en}>
                  <button type="button" aria-expanded={openSkill === i} onClick={() => chooseSkill(i)} onPointerEnter={e => { if (e.pointerType === 'mouse') chooseSkill(i); }}>
                    {s.name[lang]}<i aria-hidden="true">+</i>
                  </button>
                  {openSkill === i ? <ul>{s.items.map(item => <li key={item}>{item}</li>)}</ul> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="services" id="services">
          <p className="kicker reveal">{services.kicker[lang]}</p>
          <h2 className="title reveal">{services.title[lang]}</h2>
          <p className="services-intro reveal">{services.intro[lang]}</p>
          <ul className="offers reveal">
            {services.offers.map(o => <li key={o.en}>{o[lang]}</li>)}
          </ul>
          <ol className="steps">
            {services.steps.map((step, i) => (
              <li className="panel step reveal" key={step.name.en}>
                <span className="num">{(i + 1).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span>
                <h3>{step.name[lang]}</h3>
                <p>{step.detail[lang]}</p>
              </li>
            ))}
          </ol>
          <a className="chip primary services-cta reveal" href="#request">{services.cta[lang]}</a>
        </section>

        <ProjectRequest lang={lang} />

        <section className="contact" id="contact" data-stop>
          <p className="kicker reveal">{contact.kicker[lang]}</p>
          <h2 className="title reveal">{contact.title[lang]}</h2>
          <p className="contact-note reveal">{contact.note[lang]}</p>
          <div className="contact-links reveal">
            <a className="chip primary ltr" href={`mailto:${contact.email}`}>{contact.email}</a>
            <a className="chip ltr" href={contact.phoneHref}>{contact.phone}</a>
            <a className="chip ltr" href={contact.linkedin} target="_blank" rel="noopener noreferrer">{contact.linkedinLabel}</a>
            <a className="chip ltr" href={contact.github} target="_blank" rel="noopener noreferrer">{contact.githubLabel}</a>
            <a className="chip" href={contact.resume} download>{ui.resume[lang]}</a>
          </div>
        </section>
      </main>
    </div>
  );
}
