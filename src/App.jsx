import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import QuickQuoteSection from './QuickQuote.jsx';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// CONSTANTS
// ============================================
const GLOBE_SEA_FRAMES  = 200;
const SEA_FLIGHT_FRAMES = 200;
const TOTAL_FRAMES = GLOBE_SEA_FRAMES + SEA_FLIGHT_FRAMES; // 400

const FRAME_URL = (globalIndex) => {
  if (globalIndex < GLOBE_SEA_FRAMES) {
    const n = (globalIndex + 1).toString().padStart(3, '0');
    return `/globe-sea/ezgif-frame-${n}.jpg`;
  } else {
    const n = (globalIndex - GLOBE_SEA_FRAMES + 1).toString().padStart(3, '0');
    return `/sea-flight/ezgif-frame-${n}.jpg`;
  }
};

// ── Narrative chapters ────────────────────────────────────────────────────────
const CHAPTERS = [
  // ── ACT 1: Globe → Sea ──────────────────────────────────────────────────
  {
    id: 'world',
    label: 'Act I — The World Awaits',
    titleLines: ['Unleash', 'Global', 'Trade'],
    titleAccentLine: 2,
    body: "Every continent. Every corridor. Every deadline. Bejoice charts the most intelligent route between your cargo and the world \u2014 before the tide even turns.",
    frameStart: 0,
    frameEnd: 44,
    align: 'left',
    isHero: true,
  },
  {
    id: 'routes',
    label: 'Act I — Charting Your Course',
    titleLines: ['Chart the Course.', 'Own the Ocean.'],
    body: 'Thousands of nautical miles, calculated to the hour. Our sea freight specialists engineer the optimal route \u2014 so your cargo rides the current, never fights it.',
    frameStart: 45,
    frameEnd: 89,
    align: 'right',
  },
  {
    id: 'horizon',
    label: 'Act I — The Open Horizon',
    titleLines: ['Where the Sea', 'Becomes Strategy.'],
    body: "Saudi Arabia sits at the crossroads of the world\u2019s busiest trade lanes. Bejoice turns that geography into your competitive advantage \u2014 port to port, without compromise.",
    frameStart: 90,
    frameEnd: 144,
    align: 'left',
  },
  {
    id: 'maritime',
    label: 'Act I — Maritime Mastery',
    titleLines: ['Deep Water.', 'Deeper Trust.'],
    body: 'FCL or LCL, reefer or breakbulk \u2014 our vessels move with the precision of a tide chart and the muscle of an entire fleet. The sea is not an obstacle. It is our highway.',
    frameStart: 145,
    frameEnd: 199,
    align: 'right',
    stats: [
      { value: '45+', label: 'Global Ports' },
      { value: '12M', label: 'TEUs Handled' },
    ],
  },

  // ── ACT 2: Sea → Flight ──────────────────────────────────────────────────
  {
    id: 'liftoff',
    label: 'Act II — The Ascent',
    titleLines: ['Leave the Waves.', 'Rule the Sky.'],
    body: 'When the ocean is too slow, we lift off. Bejoice bridges sea and air in a single, seamless handoff \u2014 your shipment ascends without missing a beat.',
    frameStart: 200,
    frameEnd: 254,
    align: 'left',
  },
  {
    id: 'airways',
    label: 'Act II — Commanding the Airways',
    titleLines: ['Airborne.', 'On Time.', 'Every Time.'],
    body: '150+ destinations. Priority lanes. Same-day uplift where it matters. When every hour carries a price tag, Bejoice air freight is the answer that never blinks.',
    frameStart: 255,
    frameEnd: 319,
    align: 'right',
    stats: [
      { value: '150+', label: 'Destinations' },
      { value: '24/7', label: 'Live Tracking' },
    ],
  },
  {
    id: 'promise',
    label: 'Act II — The Bejoice Promise',
    titleLines: ['One Partner.', 'Every Mile.'],
    body: 'Sea or sky, port or runway \u2014 Bejoice is the single thread that connects your supply chain from origin to delivery. No gaps. No excuses. Just results.',
    frameStart: 320,
    frameEnd: 399,
    align: 'center',
    hasCTA: true,
  },
];

// ============================================
// LOADING SCREEN — Apple minimal
// ============================================
function LoadingScreen({ progress, isLoaded }) {
  const screenRef = useRef(null);

  useEffect(() => {
    if (isLoaded && screenRef.current) {
      gsap.to(screenRef.current, {
        opacity: 0,
        duration: 1.4,
        ease: 'power3.inOut',
        delay: 0.5,
        onComplete: () => {
          if (screenRef.current) screenRef.current.style.display = 'none';
        },
      });
    }
  }, [isLoaded]);

  return (
    <div ref={screenRef} className="loading-screen">
      <div className="loading-logo">
        Bejoice <span>Group</span>
      </div>
      <div className="loading-bar-track">
        <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-percentage">{Math.round(progress)} %</div>
    </div>
  );
}

// ============================================
// BJS WING LOGO — inline SVG emblem
// ============================================
function BJSLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* Wing emblem */}
      <svg
        width="44"
        height="28"
        viewBox="0 0 44 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8d48a" />
            <stop offset="55%" stopColor="#c8a84e" />
            <stop offset="100%" stopColor="#a8843e" />
          </linearGradient>
          <linearGradient id="wingGradR" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8d48a" />
            <stop offset="55%" stopColor="#c8a84e" />
            <stop offset="100%" stopColor="#a8843e" />
          </linearGradient>
        </defs>

        {/* Left wing — outer feather */}
        <path
          d="M22 20 C17 15, 9 10, 1 8 C5 12, 10 15, 16 18 Z"
          fill="url(#wingGrad)"
          opacity="0.95"
        />
        {/* Left wing — mid feather */}
        <path
          d="M22 18 C18 12, 12 7, 5 3 C8 8, 13 12, 18 16 Z"
          fill="url(#wingGrad)"
          opacity="0.75"
        />
        {/* Left wing — inner feather */}
        <path
          d="M22 16 C20 10, 17 5, 14 1 C16 6, 18 11, 21 15 Z"
          fill="url(#wingGrad)"
          opacity="0.55"
        />

        {/* Right wing — outer feather */}
        <path
          d="M22 20 C27 15, 35 10, 43 8 C39 12, 34 15, 28 18 Z"
          fill="url(#wingGradR)"
          opacity="0.95"
        />
        {/* Right wing — mid feather */}
        <path
          d="M22 18 C26 12, 32 7, 39 3 C36 8, 31 12, 26 16 Z"
          fill="url(#wingGradR)"
          opacity="0.75"
        />
        {/* Right wing — inner feather */}
        <path
          d="M22 16 C24 10, 27 5, 30 1 C28 6, 26 11, 23 15 Z"
          fill="url(#wingGradR)"
          opacity="0.55"
        />

        {/* Center body — teardrop */}
        <path
          d="M22 26 C20 22, 19 19, 22 14 C25 19, 24 22, 22 26 Z"
          fill="url(#wingGrad)"
          opacity="0.9"
        />
      </svg>

      {/* Wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, gap: '0.05rem' }}>
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.2rem',
            fontWeight: 400,
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.93)',
            textIndent: '0.38em',
          }}
        >
          Bejoice
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.52rem',
            fontWeight: 500,
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            color: 'rgba(200,168,78,0.75)',
            textIndent: '0.45em',
          }}
        >
          Group
        </span>
      </div>
    </div>
  );
}

// ============================================
// HEADER — frosted glass on scroll
// ============================================
function Header({ onToolsClick, onQuoteClick }) {
  const headerRef = useRef(null);

  useEffect(() => {
    if (!headerRef.current) return;

    gsap.fromTo(
      headerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.4, ease: 'power2.out', delay: 1.8 }
    );

    const onScroll = () => {
      if (!headerRef.current) return;
      if (window.scrollY > 40) {
        headerRef.current.classList.add('scrolled');
      } else {
        headerRef.current.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className="header-glass fixed top-0 left-0 w-full z-50 opacity-0"
    >
      <div className="flex items-center justify-between px-8 md:px-14 py-4">
        <BJSLogo />

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button
            onClick={onQuoteClick}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(200,168,78,0.85)',
              background: 'rgba(200,168,78,0.08)',
              border: '1px solid rgba(200,168,78,0.25)',
              borderRadius: '2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: '0.35rem 1rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,168,78,0.15)'; e.currentTarget.style.borderColor = 'rgba(200,168,78,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,168,78,0.08)'; e.currentTarget.style.borderColor = 'rgba(200,168,78,0.25)'; }}
          >
            Quick Quote
          </button>
          <button
            onClick={onToolsClick}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(200,168,78,0.65)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              padding: '0.25rem 0',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(200,168,78,1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(200,168,78,0.65)')}
          >
            Tools
          </button>
          <button
            id="contact-btn"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              padding: '0.25rem 0',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            Contact
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================
// ACT DIVIDER — cinematic title between acts
// ============================================
function ActDivider({ label, title }) {
  const ref      = useRef(null);
  const labelRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const enter = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: 'top 75%', end: 'top 25%', scrub: 1.2 },
    });
    enter.fromTo(labelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: 'power3.out' }, 0);
    enter.fromTo(titleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'power3.out' }, 0.1);

    const exit = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: 'bottom 65%', end: 'bottom 15%', scrub: 1.2 },
    });
    exit.to(ref.current, { opacity: 0, y: -20, ease: 'power2.in' });

    return () => {
      enter.scrollTrigger?.kill(); enter.kill();
      exit.scrollTrigger?.kill();  exit.kill();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1,
        textAlign: 'center',
        padding: '0 2rem',
      }}
    >
      {/* Decorative line above */}
      <div
        ref={labelRef}
        style={{ opacity: 0, display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}
      >
        <div style={{ width: '3rem', height: '1px', background: 'rgba(200,168,78,0.5)' }} />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.6rem',
            fontWeight: 500,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(200,168,78,0.65)',
          }}
        >
          {label}
        </span>
        <div style={{ width: '3rem', height: '1px', background: 'rgba(200,168,78,0.5)' }} />
      </div>

      <h2
        ref={titleRef}
        className="act-divider-title"
        style={{ opacity: 0, whiteSpace: 'pre-line' }}
      >
        {title}
      </h2>
    </div>
  );
}

// ============================================
// CHAPTER SECTION
// ============================================
function ChapterSection({ chapter }) {
  const sectionRef = useRef(null);
  const blockRef   = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const block   = blockRef.current;
    if (!section || !block) return;

    let enter = null;
    if (chapter.isHero) {
      // Hero: visible immediately, no scroll entry
      block.style.opacity = '1';
      gsap.fromTo(
        Array.from(block.children),
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, ease: 'power3.out', stagger: 0.1, duration: 1, delay: 1.6 }
      );
    } else {
      enter = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 25%', scrub: 1.2 },
      });
      enter.fromTo(
        block,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, ease: 'power3.out' }
      );
    }

    const exit = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'bottom 65%', end: 'bottom 15%', scrub: 1.2 },
    });
    exit.to(block, { opacity: 0, y: -24, ease: 'power2.in' });

    return () => {
      enter?.scrollTrigger?.kill(); enter?.kill();
      exit.scrollTrigger?.kill();  exit.kill();
    };
  }, [chapter.isHero]);

  const isRight  = chapter.align === 'right';
  const isCenter = chapter.align === 'center';

  return (
    <section
      ref={sectionRef}
      id={`section-${chapter.id}`}
      className={`chapter-section chapter-section-${chapter.align} relative z-10`}
    >
      <div ref={blockRef} className={`chapter-block${chapter.isHero ? ' chapter-block-hero' : ''}`} style={{ opacity: 0 }}>

        {/* Label with decorative line */}
        <div className="chapter-label">{chapter.label}</div>

        {/* Title — Bebas Neue display, with optional gold accent on first line */}
        <h2
          className="section-title"
          style={{ whiteSpace: 'pre-line' }}
        >
          {chapter.titleLines.map((line, i) => (
            <span key={i} style={{ display: 'block' }}>
              {i === (chapter.titleAccentLine ?? -1) ? (
                <span className="title-accent">{line}</span>
              ) : line}
            </span>
          ))}
        </h2>

        {/* Body copy */}
        <p className="section-body">{chapter.body}</p>

        {/* Optional stats row */}
        {chapter.stats && (
          <div className={`stats-row${isRight ? ' stats-right' : ''}`}
            style={isRight ? { justifyContent: 'flex-end' } : {}}
          >
            {chapter.stats.map(s => (
              <div key={s.label} className="stat-item">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {chapter.hasCTA && (
          <div style={{ marginTop: '2.8rem', display: 'flex', flexDirection: 'column', alignItems: isCenter ? 'center' : 'flex-start', gap: '1rem' }}>
            <button
              id="cta-start-journey"
              className="cta-button"
              onClick={() => document.getElementById('quick-quote-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get a Quick Quote
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.22)',
            }}>
              Sea · Air · Land · Customs · Project Cargo
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================
// CBM CALCULATOR
// ============================================
function CBMCalculator() {
  const [unit, setUnit]     = useState('cm');
  const [rows, setRows]     = useState([{ l: '', w: '', h: '', qty: '1' }]);
  const [result, setResult] = useState(null);

  const addRow = () => setRows(r => [...r, { l: '', w: '', h: '', qty: '1' }]);
  const removeRow = (i) => setRows(r => r.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const calculate = () => {
    const divisor = unit === 'cm' ? 1000000 : 1;
    let totalCBM = 0;
    for (const row of rows) {
      const l = parseFloat(row.l) || 0;
      const w = parseFloat(row.w) || 0;
      const h = parseFloat(row.h) || 0;
      const qty = parseInt(row.qty) || 1;
      totalCBM += (l * w * h / divisor) * qty;
    }

    let container = '';
    if (totalCBM <= 25)       container = '20ft Standard (≤25 CBM)';
    else if (totalCBM <= 67)  container = '40ft Standard (≤67 CBM)';
    else if (totalCBM <= 76)  container = '40ft High Cube (≤76 CBM)';
    else                       container = `Multiple containers needed`;

    setResult({ cbm: totalCBM.toFixed(3), container });
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.4rem',
    padding: '0.5rem 0.65rem',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.8rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="calc-card">
      <div className="calc-card-header">
        {/* Ship icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7-7H6a2 2 0 0 0-2 2v12"/>
          <path d="M14 2v6h6"/>
          <path d="M4 12h16"/>
        </svg>
        <h3 className="calc-title">CBM Calculator</h3>
      </div>
      <p className="calc-subtitle">Calculate cubic meters for sea freight containers</p>

      {/* Unit toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['cm', 'm'].map(u => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`unit-btn${unit === u ? ' active' : ''}`}
          >
            {u === 'cm' ? 'Centimetres' : 'Metres'}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div className="calc-row-header">
        <span>L ({unit})</span>
        <span>W ({unit})</span>
        <span>H ({unit})</span>
        <span>Qty</span>
        <span />
      </div>

      {/* Cargo rows */}
      {rows.map((row, i) => (
        <div key={i} className="calc-row">
          {['l', 'w', 'h', 'qty'].map(field => (
            <input
              key={field}
              type="number"
              min="0"
              placeholder="0"
              value={row[field]}
              onChange={e => updateRow(i, field, e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          ))}
          <button
            onClick={() => removeRow(i)}
            className="row-remove-btn"
            disabled={rows.length === 1}
          >
            ×
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
        <button onClick={addRow} className="calc-secondary-btn">+ Add Row</button>
        <button onClick={calculate} className="calc-primary-btn">Calculate</button>
      </div>

      {result && (
        <div className="calc-result">
          <div className="calc-result-main">
            <span className="calc-result-value">{result.cbm}</span>
            <span className="calc-result-unit">CBM</span>
          </div>
          <div className="calc-result-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.7)" strokeWidth="2"><path d="M21 10H3M21 6H3M21 14H3M21 18H3"/></svg>
            {result.container}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// AIR CHARGEABLE WEIGHT CALCULATOR
// ============================================
function AirWeightCalculator() {
  const [actual, setActual]   = useState('');
  const [length, setLength]   = useState('');
  const [width, setWidth]     = useState('');
  const [height, setHeight]   = useState('');
  const [qty, setQty]         = useState('1');
  const [result, setResult]   = useState(null);

  const calculate = () => {
    const kg  = parseFloat(actual)  || 0;
    const l   = parseFloat(length)  || 0;
    const w   = parseFloat(width)   || 0;
    const h   = parseFloat(height)  || 0;
    const q   = parseInt(qty)       || 1;

    const volWeight = (l * w * h / 5000) * q;
    const actWeight = kg * q;
    const chargeable = Math.max(volWeight, actWeight);
    const basis = volWeight >= actWeight ? 'volumetric' : 'actual';

    setResult({
      actual:     actWeight.toFixed(2),
      volumetric: volWeight.toFixed(2),
      chargeable: chargeable.toFixed(2),
      basis,
    });
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.4rem',
    padding: '0.5rem 0.65rem',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.8rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.6rem',
    fontWeight: 500,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: '0.35rem',
    display: 'block',
  };

  return (
    <div className="calc-card">
      <div className="calc-card-header">
        {/* Plane icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-1 0-1.5.5-3.5 2L11 8.2l-8.2 1.8-.6.6 6.4 2.4 2.4 6.4.6-.6z"/>
        </svg>
        <h3 className="calc-title">Air Chargeable Weight</h3>
      </div>
      <p className="calc-subtitle">Actual vs volumetric — you pay the higher</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Actual Weight (kg)</label>
          <input
            type="number" min="0" placeholder="0.00"
            value={actual} onChange={e => setActual(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
        <div>
          <label style={labelStyle}>Qty (pieces)</label>
          <input
            type="number" min="1" placeholder="1"
            value={qty} onChange={e => setQty(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {[['Length (cm)', length, setLength], ['Width (cm)', width, setWidth], ['Height (cm)', height, setHeight]].map(([lbl, val, setter]) => (
          <div key={lbl}>
            <label style={labelStyle}>{lbl}</label>
            <input
              type="number" min="0" placeholder="0"
              value={val} onChange={e => setter(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
        ))}
      </div>

      <button onClick={calculate} className="calc-primary-btn" style={{ width: '100%' }}>
        Calculate Chargeable Weight
      </button>

      {result && (
        <div className="calc-result" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="calc-mini-stat">
              <span className="calc-mini-label">Actual</span>
              <span className="calc-mini-value">{result.actual} kg</span>
            </div>
            <div className="calc-mini-stat">
              <span className="calc-mini-label">Volumetric</span>
              <span className="calc-mini-value">{result.volumetric} kg</span>
            </div>
          </div>
          <div className="calc-result-main">
            <span className="calc-result-value">{result.chargeable}</span>
            <span className="calc-result-unit">kg chargeable</span>
          </div>
          <div className="calc-result-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.7)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            Billed on {result.basis} weight
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// TOOLS SECTION
// ============================================
function ToolsSection({ sectionRef }) {
  return (
    <div ref={sectionRef} id="tools-section" className="tools-section">
      {/* Background texture */}
      <div className="tools-bg-line" />

      <div className="tools-inner">
        {/* Header */}
        <div className="tools-header">
          <div className="chapter-label" style={{ justifyContent: 'center' }}>
            Freight Intelligence
          </div>
          <h2 className="tools-title">
            Calculate.<br />
            <span className="title-accent">Decide. Ship.</span>
          </h2>
          <p className="tools-subtitle">
            Instant freight calculations — no signup, no guesswork.
            Sea or air, get the numbers you need before you book.
          </p>
        </div>

        {/* Calculator grid */}
        <div className="tools-grid">
          <CBMCalculator />
          <AirWeightCalculator />
        </div>

        {/* Footer note */}
        <p className="tools-footnote">
          Calculations are estimates based on standard carrier formulas (volumetric divisor 5000 for air).
          Final rates confirmed at booking.
        </p>
      </div>
    </div>
  );
}

// ============================================
// PROGRESS BAR
// ============================================
function ProgressBar() {
  const fillRef = useRef(null);

  useEffect(() => {
    if (!fillRef.current) return;
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (fillRef.current) fillRef.current.style.width = `${self.progress * 100}%`;
      },
    });
  }, []);

  return (
    <div className="progress-bar-track">
      <div ref={fillRef} className="progress-bar-fill" />
    </div>
  );
}

// ============================================
// ACT INDICATOR — floating pill
// ============================================
function ActIndicator({ currentAct }) {
  const ref     = useRef(null);
  const prevAct = useRef(currentAct);

  useEffect(() => {
    if (!ref.current || prevAct.current === currentAct) return;
    prevAct.current = currentAct;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 10, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.7)' }
    );
    const hide = setTimeout(() => {
      gsap.to(ref.current, { opacity: 0, y: -6, duration: 0.4, ease: 'power2.in' });
    }, 2400);
    return () => clearTimeout(hide);
  }, [currentAct]);

  return (
    <div
      ref={ref}
      className="act-indicator"
      style={{
        position: 'fixed',
        bottom: '2.8rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        opacity: 0,
        pointerEvents: 'none',
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.6rem',
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: 'rgba(200,168,78,0.85)',
        background: 'rgba(5,5,8,0.55)',
        border: '1px solid rgba(200,168,78,0.18)',
        borderRadius: '2rem',
        padding: '0.38rem 1.1rem',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        whiteSpace: 'nowrap',
      }}
    >
      {currentAct === 1 ? 'Act I — Globe to Sea' : 'Act II — Sea to Flight'}
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const canvasRef          = useRef(null);
  const imagesRef          = useRef([]);
  const frameObjRef        = useRef({ frame: 0 });
  const toolsSectionRef    = useRef(null);
  const quoteSectionRef    = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded]         = useState(false);
  const [currentAct, setCurrentAct]     = useState(1);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const scrollToTools = useCallback(() => {
    toolsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  const scrollToQuote = useCallback(() => {
    quoteSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── DRAW FRAME ──────────────────────────────────────────────────────────────
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Smooth mouse/gyro parallax
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

    // Gentle ambient drift
    const dpr    = window.devicePixelRatio || 1;
    const t      = performance.now() / 1000;
    const driftX = (Math.sin(t * 0.17) * 4 + Math.sin(t * 0.08) * 2) * dpr;
    const driftY = (Math.cos(t * 0.13) * 3 + Math.cos(t * 0.09) * 1) * dpr;

    // Portrait → contain; landscape → cover
    const isPortrait = ch > cw;
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, cw, ch);

    const scale = isPortrait
      ? Math.min(cw / iw, ch / ih)
      : Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;

    const bleedX = Math.max((dw - cw) / 2, 0);
    const bleedY = Math.max((dh - ch) / 2, 0);
    const rawPx  = isPortrait ? 0 : mouseRef.current.x * 12 * dpr + driftX;
    const rawPy  = isPortrait ? 0 : mouseRef.current.y *  8 * dpr + driftY;
    const px     = Math.max(-bleedX, Math.min(bleedX, rawPx));
    const py     = Math.max(-bleedY, Math.min(bleedY, rawPy));

    const dx  = Math.round((cw - dw) / 2 + px);
    const dy  = Math.round((ch - dh) / 2 + py);
    const ddw = Math.round(dw);
    const ddh = Math.round(dh);

    ctx.drawImage(img, dx, dy, ddw, ddh);

    // Vignette overlay
    const vigCx    = cw / 2;
    const vigCy    = ch / 2;
    const vigInner = isPortrait ? Math.min(dw, dh) * 0.08 : ch * 0.10;
    const vigOuter = isPortrait ? Math.max(dw, dh) * 0.72 : Math.max(cw, ch) * 0.82;
    const vig = ctx.createRadialGradient(vigCx, vigCy, vigInner, vigCx, vigCy, vigOuter);
    vig.addColorStop(0,    'rgba(0,0,0,0)');
    vig.addColorStop(0.45, 'rgba(0,0,0,0)');
    vig.addColorStop(0.74, 'rgba(0,0,0,0.18)');
    vig.addColorStop(1,    'rgba(0,0,0,0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, cw, ch);
  }, []);

  // ── MOUSE & GYROSCOPE PARALLAX ──────────────────────────────────────────────
  useEffect(() => {
    const onMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth)  * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current.targetX = -nx;
      mouseRef.current.targetY = -ny;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onOrientation = (e) => {
      const nx = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
      const ny = Math.max(-1, Math.min(1, ((e.beta || 0) - 20) / 40));
      mouseRef.current.targetX = -nx;
      mouseRef.current.targetY = -ny;
    };
    if (window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        document.addEventListener('click', () => {
          DeviceOrientationEvent.requestPermission()
            .then(s => s === 'granted' && window.addEventListener('deviceorientation', onOrientation))
            .catch(() => {});
        }, { once: true });
      } else {
        window.addEventListener('deviceorientation', onOrientation);
      }
    }

    // RAF loop for ambient drift
    let active = true;
    const loop = () => {
      if (!active) return;
      drawFrame(Math.round(frameObjRef.current.frame));
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => {
      active = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [drawFrame]);

  // ── RESIZE CANVAS ───────────────────────────────────────────────────────────
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = Math.round(window.innerWidth  * dpr);
    const h   = Math.round(window.innerHeight * dpr);
    canvas.width        = w;
    canvas.height       = h;
    canvas.style.width  = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawFrame(Math.round(frameObjRef.current.frame));
  }, [drawFrame]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // ── PRELOAD ALL 400 FRAMES ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const images = new Array(TOTAL_FRAMES).fill(null);
    let loaded = 0;

    const onLoad = () => {
      if (cancelled) return;
      loaded++;
      setLoadProgress((loaded / TOTAL_FRAMES) * 100);
      if (loaded === TOTAL_FRAMES) setIsLoaded(true);
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_URL(i);
      img.onload  = onLoad;
      img.onerror = onLoad;
      images[i] = img;
    }

    imagesRef.current = images;
    return () => { cancelled = true; };
  }, []);

  // ── GSAP SCROLL ANIMATION ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    drawFrame(0);

    const trigger = ScrollTrigger.create({
      trigger: '#scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const newFrame = Math.round(self.progress * (TOTAL_FRAMES - 1));
        if (newFrame !== Math.round(frameObjRef.current.frame)) {
          frameObjRef.current.frame = newFrame;
          drawFrame(newFrame);
          setCurrentAct(newFrame < GLOBE_SEA_FRAMES ? 1 : 2);
        }
      },
    });

    return () => trigger.kill();
  }, [isLoaded, drawFrame]);

  // ── DRAW INITIAL FRAME ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && canvasRef.current) {
      const timer = setTimeout(() => { handleResize(); drawFrame(0); }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, handleResize, drawFrame]);

  // ── LENIS SMOOTH SCROLL ──────────────────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    return () => lenis.destroy();
  }, []);

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <>
      <LoadingScreen progress={loadProgress} isLoaded={isLoaded} />

      {/* Fixed canvas — all frames paint here */}
      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>

      <Header onToolsClick={scrollToTools} onQuoteClick={scrollToQuote} />
      <ActIndicator currentAct={currentAct} />

      <div id="scroll-container" className="relative z-10">
        {/* Opening spacer — minimal so hero text is visible from the start */}
        <div style={{ height: '5vh' }} />

        {/* Act 1 chapters */}
        {CHAPTERS.filter(c => c.frameStart < GLOBE_SEA_FRAMES).map(chapter => (
          <ChapterSection key={chapter.id} chapter={chapter} />
        ))}

        {/* Act transition divider */}
        <ActDivider
          label="Transition — Sea to Sky"
          title={"Now,\nWe Take Flight."}
        />

        {/* Act 2 chapters */}
        {CHAPTERS.filter(c => c.frameStart >= GLOBE_SEA_FRAMES).map(chapter => (
          <ChapterSection key={chapter.id} chapter={chapter} />
        ))}

        {/* Closing spacer */}
        <div style={{ height: '40vh' }} />
      </div>

      {/* Quick Quote section */}
      <QuickQuoteSection sectionRef={quoteSectionRef} />

      {/* Tools section — below scroll, normal page flow */}
      <ToolsSection sectionRef={toolsSectionRef} />

      <ProgressBar />
    </>
  );
}
