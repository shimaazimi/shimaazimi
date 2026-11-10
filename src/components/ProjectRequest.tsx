'use client';

import { useRef, useState } from 'react';
import { contact, type Lang } from '@/content/content';
import { FORM_KEY, request as R } from '@/content/request';

type Data = {
  type: string; stage: string; features: string[]; timeline: string;
  budget: string; name: string; contact: string; message: string; botcheck: string;
};
const EMPTY: Data = { type: '', stage: '', features: [], timeline: '', budget: '', name: '', contact: '', message: '', botcheck: '' };

type Status = 'form' | 'sending' | 'sent' | 'email';

// Labels in English for the request itself, so every summary reads the same whichever language the visitor used.
function summarize(d: Data, lang: Lang) {
  const pick = (opts: { id: string; label: { en: string } }[], id: string) => opts.find(o => o.id === id)?.label.en || '-';
  return [
    `Project: ${pick(R.type.options, d.type)}`,
    `Stage: ${pick(R.stage.options, d.stage)}`,
    `Features: ${d.features.map(f => pick(R.features.options, f)).join(', ') || '-'}`,
    `Timeline: ${pick(R.timeline.options, d.timeline)}`,
    `Budget: ${d.budget || '-'}`,
    `Name: ${d.name}`,
    `Contact: ${d.contact}`,
    `Site language: ${lang === 'fa' ? 'Persian' : 'English'}`,
    '',
    d.message || '',
  ].join('\n');
}

export default function ProjectRequest({ lang }: { lang: Lang }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>('form');
  const [copied, setCopied] = useState(false);
  const headRef = useRef<HTMLParagraphElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const t = (x: { en: string; fa: string }) => x[lang];

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    setData(d => ({ ...d, [k]: v }));
    setErrors(e => e.filter(x => x !== k));
  };
  const toggleFeature = (id: string) =>
    set('features', data.features.includes(id) ? data.features.filter(f => f !== id) : [...data.features, id]);

  const missing = (s: number) => {
    const req: (keyof Data)[][] = [['type', 'stage'], ['timeline'], ['name', 'contact']];
    return req[s].filter(k => !String(data[k]).trim());
  };
  const go = (to: number) => {
    setStep(to);
    requestAnimationFrame(() => headRef.current?.focus());
  };
  const next = () => {
    const m = missing(step);
    if (m.length) { setErrors(m); return; }
    go(step + 1);
  };

  const subject = `Project request: ${R.type.options.find(o => o.id === data.type)?.label.en || 'New project'} - ${data.name}`;
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summarize(data, lang))}`;

  const finish = (s: Status) => {
    setStatus(s);
    requestAnimationFrame(() => resultRef.current?.focus());
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = missing(2);
    if (m.length) { setErrors(m); return; }
    if (data.botcheck) return; // Filled only by bots
    if (FORM_KEY) {
      setStatus('sending');
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: FORM_KEY, subject, from_name: 'Portfolio', name: data.name,
            replyto: data.contact.includes('@') ? data.contact : undefined,
            message: summarize(data, lang),
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.success !== false) { finish('sent'); return; }
      } catch {}
    }
    // No key, or the service could not be reached: hand the request to the visitor's email app
    window.location.href = mailto;
    finish('email');
  };
  const reset = () => { setData(EMPTY); setStep(0); setStatus('form'); setCopied(false); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${contact.email}\n${subject}\n\n${summarize(data, lang)}`); setCopied(true); } catch {}
  };

  const err = (k: keyof Data) => errors.includes(k);
  const choice = (name: 'type' | 'stage' | 'timeline', block: { label: { en: string; fa: string }; options: { id: string; label: { en: string; fa: string } }[] }) => (
    <fieldset className={`choice${err(name) ? ' invalid' : ''}`} aria-describedby={err(name) ? `${name}-err` : undefined}>
      <legend>{t(block.label)}</legend>
      <div className="options">
        {block.options.map(o => (
          <label key={o.id} className={data[name] === o.id ? 'on' : undefined}>
            <input type="radio" name={name} value={o.id} checked={data[name] === o.id} onChange={() => set(name, o.id)} />
            <span>{t(o.label)}</span>
          </label>
        ))}
      </div>
      {err(name) ? <p className="error" id={`${name}-err`}>{t(R.required)}</p> : null}
    </fieldset>
  );
  const field = (name: 'budget' | 'name' | 'contact' | 'message', label: { en: string; fa: string }, hint?: { en: string; fa: string }, area = false) => {
    const props = {
      id: `req-${name}`, value: data[name], 'aria-invalid': err(name) || undefined,
      'aria-describedby': [hint ? `req-${name}-hint` : '', err(name) ? `req-${name}-err` : ''].filter(Boolean).join(' ') || undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(name, e.target.value),
    };
    return (
      <div className={`field${err(name) ? ' invalid' : ''}`}>
        <label htmlFor={`req-${name}`}>{t(label)}</label>
        {hint ? <p className="hint" id={`req-${name}-hint`}>{t(hint)}</p> : null}
        {area ? <textarea rows={4} {...props} /> : (
          <input type="text" autoComplete={name === 'name' ? 'name' : name === 'contact' ? 'email' : 'off'} dir={name === 'contact' ? 'ltr' : undefined} {...props} />
        )}
        {err(name) ? <p className="error" id={`req-${name}-err`}>{t(R.required)}</p> : null}
      </div>
    );
  };

  return (
    <section className="request" id="request">
      <p className="kicker reveal">{t(R.kicker)}</p>
      <h2 className="title reveal">{t(R.title)}</h2>
      <p className="request-intro reveal">{t(R.intro)}</p>

      <div className="panel request-card reveal">
        {status === 'sent' || status === 'email' ? (
          <div className="result" ref={resultRef} tabIndex={-1} role="status">
            <h3>{t(status === 'sent' ? R.sent.title : R.byEmail.title)}</h3>
            {status === 'sent' ? <p>{t(R.sent.body)}</p> : (
              <>
                <p>{t(R.byEmail.body)} <a href={`mailto:${contact.email}`} dir="ltr">{contact.email}</a></p>
                <pre className="summary" dir="ltr">{summarize(data, lang)}</pre>
                <div className="request-actions">
                  <a className="chip primary" href={mailto}>{t(R.byEmail.open)}</a>
                  <button className="chip" type="button" onClick={copy}>{t(copied ? R.byEmail.copied : R.byEmail.copy)}</button>
                </div>
              </>
            )}
            <button className="chip quiet again" type="button" onClick={reset}>{t(R.again)}</button>
          </div>
        ) : (
          <form onSubmit={step === 2 ? submit : e => { e.preventDefault(); next(); }} noValidate>
            <ol className="progress-steps" aria-hidden="true">
              {R.steps.map((s, i) => <li key={s.en} className={i <= step ? 'on' : undefined}>{t(s)}</li>)}
            </ol>
            <p className="step-label" ref={headRef} tabIndex={-1}>
              {t(R.stepOf).replace('{n}', (step + 1).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US'))}: {t(R.steps[step])}
            </p>

            {step === 0 ? (<>{choice('type', R.type)}{choice('stage', R.stage)}</>) : null}
            {step === 1 ? (
              <>
                <fieldset className="choice">
                  <legend>{t(R.features.label)}</legend>
                  <p className="hint">{t(R.features.hint)}</p>
                  <div className="options">
                    {R.features.options.map(o => (
                      <label key={o.id} className={data.features.includes(o.id) ? 'on' : undefined}>
                        <input type="checkbox" checked={data.features.includes(o.id)} onChange={() => toggleFeature(o.id)} />
                        <span>{t(o.label)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {choice('timeline', R.timeline)}
                {field('budget', R.budget.label, R.budget.hint)}
              </>
            ) : null}
            {step === 2 ? (
              <>
                {field('name', R.name)}
                {field('contact', R.contact.label, R.contact.hint)}
                {field('message', R.message.label, R.message.hint, true)}
                <div className="trap" aria-hidden="true">
                  <label>Leave this empty <input type="text" tabIndex={-1} autoComplete="off" value={data.botcheck} onChange={e => set('botcheck', e.target.value)} /></label>
                </div>
              </>
            ) : null}

            <div className="request-actions">
              {step > 0 ? <button className="chip" type="button" onClick={() => go(step - 1)}>{t(R.back)}</button> : null}
              <button className="chip primary" type="submit" disabled={status === 'sending'}>
                {step < 2 ? t(R.next) : t(status === 'sending' ? R.sending : R.send)}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
