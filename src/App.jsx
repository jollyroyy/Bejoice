import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// CONSTANTS
// ============================================
const GLOBE_SEA_FRAMES  = 200;   // act 1
const SEA_FLIGHT_FRAMES = 200;   // act 2
const TOTAL_FRAMES = GLOBE_SEA_FRAMES + SEA_FLIGHT_FRAMES; // 400

// Frame URL — act 1 uses /globe-sea/, act 2 uses /sea-flight/
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
// Act 1 — Globe to Sea  (global frames 0-199)
// Act 2 — Sea to Flight (global frames 200-399)
const CHAPTERS = [
  // ── ACT 1: Globe → Sea ──────────────────────────────────────────────────
  {
    id: 'world',
    label: 'Act I — The World Awaits',
    title: 'Every Journey\nBegins Here.',
    body: "From a bird\u2019s-eye view of our interconnected planet, Bejoice maps the fastest, safest corridor between your cargo and its destination \u2014 anywhere on Earth.",
    frameStart: 0,
    frameEnd: 44,
    align: 'left',
  },
  {
    id: 'routes',
    label: 'Act I — Charting Your Course',
    title: 'Precision Routes.\nGlobal Reach.',
    body: 'Our network engineers plot the optimal multi-modal path in real time — sea, air, or land — before a single crate leaves your warehouse.',
    frameStart: 45,
    frameEnd: 89,
    align: 'right',
  },
  {
    id: 'horizon',
    label: 'Act I — The Open Horizon',
    title: 'Where Continents\nMeet the Sea.',
    body: "Saudi Arabia\u2019s ports are the gateway to three continents. Bejoice leverages every nautical mile to deliver speed, capacity, and certainty.",
    frameStart: 90,
    frameEnd: 144,
    align: 'left',
  },
  {
    id: 'maritime',
    label: 'Act I — Maritime Mastery',
    title: 'Colossal Capacity.\nDeep-Sea Expertise.',
    body: 'Our maritime fleet cuts through the deep blue — FCL, LCL, reefer, breakbulk — with unparalleled reliability from port to port.',
    frameStart: 145,
    frameEnd: 199,
    align: 'right',
  },

  // ── ACT 2: Sea → Flight ──────────────────────────────────────────────────
  {
    id: 'liftoff',
    label: 'Act II — The Ascent',
    title: 'From Ocean\nto Open Sky.',
    body: 'When time is the currency, we shift seamlessly from sea to air — our premium cargo network launches your shipment above every delay.',
    frameStart: 200,
    frameEnd: 254,
    align: 'left',
  },
  {
    id: 'airways',
    label: 'Act II — Commanding the Airways',
    title: 'Speed Is\nOur Standard.',
    body: 'Connecting 150+ destinations across Asia, Europe, and the Americas, our air freight solutions deliver critical cargo when every hour counts.',
    frameStart: 255,
    frameEnd: 319,
    align: 'right',
  },
  {
    id: 'promise',
    label: 'Act II — The Bejoice Promise',
    title: 'Safe. Seamless.\nDelivered.',
    body: 'Globe, sea, sky — one seamless journey, zero friction. Bejoice closes the loop from origin to destination with precision, care, and complete visibility.',
    frameStart: 320,
    frameEnd: 399,
    align: 'center',
    hasCTA: true,
  },
];

// ============================================
// LOADING SCREEN
// ============================================
function LoadingScreen({ progress, isLoaded }) {
  const screenRef = useRef(null);

  useEffect(() => {
    if (isLoaded && screenRef.current) {
      gsap.to(screenRef.current, {
        opacity: 0,
        duration: 1.2,
        ease: 'power3.inOut',
        delay: 0.4,
        onComplete: () => {
          if (screenRef.current) screenRef.current.style.display = 'none';
        },
      });
    }
  }, [isLoaded]);

  return (
    <div ref={screenRef} className="loading-screen">
      <div className="loading-logo">Bejoice Group</div>
      <div className="loading-bar-track">
        <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-percentage">{Math.round(progress)}</div>
    </div>
  );
}

// ============================================
// HEADER
// ============================================
function Header() {
  const headerRef = useRef(null);

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      headerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.4, ease: 'power2.out', delay: 1.6 }
    );
  }, []);

  return (
    <header
      ref={headerRef}
      className="header-glass fixed top-0 left-0 w-full z-50 opacity-0"
    >
      <div className="flex items-center justify-between px-8 md:px-14 py-5">
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)' }}>
          Bejoice
          <span style={{ color: 'rgba(200,168,78,0.75)', marginLeft: '0.4em', fontSize: '0.75rem', fontWeight: 400, letterSpacing: '0.4em' }}>Group</span>
        </div>
        <button
          id="contact-btn"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.7rem',
            fontWeight: 400,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.25s ease',
            padding: '0.25rem 0',
          }}
          onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.9)'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
        >
          Contact
        </button>
      </div>
    </header>
  );
}

// ============================================
// ACT DIVIDER — subtle fullscreen title card between acts
// ============================================
function ActDivider({ label, title }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const enter = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: 'top 75%', end: 'top 25%', scrub: 1.2 },
    });
    enter.fromTo(ref.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'power3.out' });
    const exit = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: 'bottom 65%', end: 'bottom 15%', scrub: 1.2 },
    });
    exit.to(ref.current, { opacity: 0, y: -20, ease: 'power2.in' });
    return () => { enter.scrollTrigger?.kill(); enter.kill(); exit.scrollTrigger?.kill(); exit.kill(); };
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
        opacity: 0,
        textAlign: 'center',
        padding: '0 2rem',
      }}
    >
      <div className="chapter-label" style={{ marginBottom: '1rem' }}>{label}</div>
      <h2 className="section-title" style={{ whiteSpace: 'pre-line', fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}>{title}</h2>
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

    const enter = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 25%', scrub: 1.2 },
    });
    enter.fromTo(block, { opacity: 0, y: 36 }, { opacity: 1, y: 0, ease: 'power3.out' });

    const exit = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'bottom 65%', end: 'bottom 15%', scrub: 1.2 },
    });
    exit.to(block, { opacity: 0, y: -24, ease: 'power2.in' });

    return () => {
      enter.scrollTrigger?.kill(); enter.kill();
      exit.scrollTrigger?.kill();  exit.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id={`section-${chapter.id}`}
      className={`chapter-section chapter-section-${chapter.align} relative z-10`}
    >
      <div ref={blockRef} className="chapter-block" style={{ opacity: 0 }}>
        <div className="chapter-label">{chapter.label}</div>
        <h2 className="section-title" style={{ whiteSpace: 'pre-line' }}>{chapter.title}</h2>
        <p className="section-body">{chapter.body}</p>

        {chapter.hasCTA && (
          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: chapter.align === 'center' ? 'center' : 'flex-start' }}>
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
// ACT INDICATOR — subtle floating pill
// ============================================
function ActIndicator({ currentAct }) {
  const ref = useRef(null);
  const prevAct = useRef(currentAct);

  useEffect(() => {
    if (!ref.current || prevAct.current === currentAct) return;
    prevAct.current = currentAct;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
    const hide = setTimeout(() => {
      gsap.to(ref.current, { opacity: 0, duration: 0.4 });
    }, 2200);
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
        fontSize: '0.62rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'rgba(200,168,78,0.8)',
        background: 'rgba(0,0,0,0.45)',
        border: '1px solid rgba(200,168,78,0.2)',
        borderRadius: '2rem',
        padding: '0.35rem 1rem',
        backdropFilter: 'blur(12px)',
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
  const imagesRef    = useRef([]);    // length = TOTAL_FRAMES (400)
  const frameObjRef  = useRef({ frame: 0 });
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded]         = useState(false);
  const [currentAct, setCurrentAct]     = useState(1);
  const mouseRef     = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // ── DRAW FRAME ──────────────────────────────────────────────────────────────
  // Operates in true physical pixels. No ctx.filter, no ctx.scale.
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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

    // Gentle ambient drift in physical pixels
    const dpr    = window.devicePixelRatio || 1;
    const t      = performance.now() / 1000;
    const driftX = (Math.sin(t * 0.17) * 4 + Math.sin(t * 0.08) * 2) * dpr;
    const driftY = (Math.cos(t * 0.13) * 3 + Math.cos(t * 0.09) * 1) * dpr;

    ctx.clearRect(0, 0, cw, ch);

    // Cover-scale
    const scale  = Math.max(cw / iw, ch / ih);
    const dw     = iw * scale;
    const dh     = ih * scale;

    // Clamp parallax to bleed margin
    const bleedX = Math.max((dw - cw) / 2, 0);
    const bleedY = Math.max((dh - ch) / 2, 0);
    const rawPx  = mouseRef.current.x * 12 * dpr + driftX;
    const rawPy  = mouseRef.current.y *  8 * dpr + driftY;
    const px     = Math.max(-bleedX, Math.min(bleedX, rawPx));
    const py     = Math.max(-bleedY, Math.min(bleedY, rawPy));

    const dx  = Math.round((cw - dw) / 2 + px);
    const dy  = Math.round((ch - dh) / 2 + py);
    const ddw = Math.round(dw);
    const ddh = Math.round(dh);

    // ── PASS 1: sharp frame draw ───────────────────────────────────────────
    ctx.drawImage(img, dx, dy, ddw, ddh);

    // ── PASS 2: vignette overlay — no re-draw, just gradient fill ─────────
    const vig = ctx.createRadialGradient(
      cw / 2, ch * 0.5, ch * 0.10,
      cw / 2, ch * 0.5, Math.max(cw, ch) * 0.82
    );
    vig.addColorStop(0,    'rgba(0,0,0,0)');
    vig.addColorStop(0.45, 'rgba(0,0,0,0)');
    vig.addColorStop(0.74, 'rgba(0,0,0,0.18)');
    vig.addColorStop(1,    'rgba(0,0,0,0.52)');
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

    // RAF loop for drift animation
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
    const ctx = canvas.getContext('2d');
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
  // Prioritised: first 8 frames load immediately so user sees content fast.
  // Remaining frames load in the background.
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

    // Load first 8 immediately, rest deferred slightly
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
          // Update act indicator
          setCurrentAct(newFrame < GLOBE_SEA_FRAMES ? 1 : 2);
        }
      },
    });

    return () => trigger.kill();
  }, [isLoaded, drawFrame]);

  // ── DRAW INITIAL FRAME AFTER MOUNT ──────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <LoadingScreen progress={loadProgress} isLoaded={isLoaded} />

      {/* Fixed full-viewport canvas — all frames paint here */}
      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>

      <Header />
      <ActIndicator currentAct={currentAct} />

      <div id="scroll-container" className="relative z-10">
        {/* Opening spacer */}
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
