import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
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
    titleLines: ['Unleash', 'the Global', 'Trade.'],
    titleAccentLine: 2, // index of line to gold-accent
    body: "From a bird\u2019s-eye view of our interconnected planet, Bejoice maps the fastest, safest corridor between your cargo and its destination \u2014 anywhere on Earth.",
    frameStart: 0,
    frameEnd: 44,
    align: 'left',
  },
  {
    id: 'routes',
    label: 'Act I — Charting Your Course',
    titleLines: ['Beyond', 'Horizons.'],
    body: 'Our network engineers plot the optimal multi-modal path in real time \u2014 sea, air, or land \u2014 before a single crate leaves your warehouse.',
    frameStart: 45,
    frameEnd: 89,
    align: 'right',
  },
  {
    id: 'horizon',
    label: 'Act I — The Open Horizon',
    titleLines: ['Command', 'The Tide.'],
    body: "Saudi Arabia\u2019s ports are the gateway to three continents. Bejoice leverages every nautical mile to deliver speed, capacity, and certainty.",
    frameStart: 90,
    frameEnd: 144,
    align: 'left',
  },
  {
    id: 'maritime',
    label: 'Act I — Maritime Mastery',
    titleLines: ['Colossal', 'Capacity.'],
    body: 'Our maritime fleet cuts through the deep blue \u2014 FCL, LCL, reefer, breakbulk \u2014 with unparalleled reliability from port to port.',
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
    titleLines: ['From Ocean', 'To Open Sky.'],
    body: 'When time is the currency, we shift seamlessly from sea to air \u2014 our premium cargo network launches your shipment above every delay.',
    frameStart: 200,
    frameEnd: 254,
    align: 'left',
  },
  {
    id: 'airways',
    label: 'Act II — Commanding the Airways',
    titleLines: ['Omniscient', 'Control.'],
    body: 'Connecting 150+ destinations across Asia, Europe, and the Americas, our air freight solutions deliver critical cargo when every hour counts.',
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
    titleLines: ['Safe.', 'Seamless.', 'Delivered.'],
    body: 'Globe, sea, sky \u2014 one seamless journey, zero friction. Bejoice closes the loop from origin to destination with precision, care, and complete visibility.',
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
// HEADER — frosted glass on scroll
// ============================================
function Header() {
  const headerRef = useRef(null);

  useEffect(() => {
    if (!headerRef.current) return;

    // Fade in after load
    gsap.fromTo(
      headerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.4, ease: 'power2.out', delay: 1.8 }
    );

    // Frosted glass on scroll
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
      <div className="flex items-center justify-between px-8 md:px-14 py-5">
        {/* Wordmark */}
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.25rem',
            fontWeight: 400,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.92)',
            textIndent: '0.35em',
          }}
        >
          Bejoice
          <span
            style={{
              color: 'rgba(200,168,78,0.8)',
              marginLeft: '0.5em',
              fontSize: '1rem',
              letterSpacing: '0.45em',
            }}
          >
            Group
          </span>
        </div>

        {/* Nav — Contact */}
        <button
          id="contact-btn"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.68rem',
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
          onMouseEnter={e => (e.target.style.color = 'rgba(255,255,255,0.85)')}
          onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.4)')}
        >
          Contact
        </button>
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

    const children = Array.from(block.children);

    const enter = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 25%', scrub: 1.2 },
    });
    // Staggered entry — each child staggers in
    enter.fromTo(
      children,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, ease: 'power3.out', stagger: 0.08 }
    );

    const exit = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'bottom 65%', end: 'bottom 15%', scrub: 1.2 },
    });
    exit.to(block, { opacity: 0, y: -24, ease: 'power2.in' });

    return () => {
      enter.scrollTrigger?.kill(); enter.kill();
      exit.scrollTrigger?.kill();  exit.kill();
    };
  }, []);

  const isRight  = chapter.align === 'right';
  const isCenter = chapter.align === 'center';

  return (
    <section
      ref={sectionRef}
      id={`section-${chapter.id}`}
      className={`chapter-section chapter-section-${chapter.align} relative z-10`}
    >
      <div ref={blockRef} className="chapter-block" style={{ opacity: 0 }}>

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
          <div style={{ marginTop: '2.8rem', display: 'flex', justifyContent: isCenter ? 'center' : 'flex-start' }}>
            <button id="cta-start-journey" className="cta-button">
              Start Your Journey
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
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
  const canvasRef    = useRef(null);
  const imagesRef    = useRef([]);
  const frameObjRef  = useRef({ frame: 0 });
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded]         = useState(false);
  const [currentAct, setCurrentAct]     = useState(1);
  const mouseRef     = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

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

      <Header />
      <ActIndicator currentAct={currentAct} />

      <div id="scroll-container" className="relative z-10">
        {/* Opening spacer — gives breathing room before first chapter */}
        <div style={{ height: '60vh' }} />

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

      <ProgressBar />
    </>
  );
}
