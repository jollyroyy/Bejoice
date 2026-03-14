// src/components/ScrollytellingHero.jsx
import { useRef } from 'react';
import { useVideoScrubber } from '../hooks/useVideoScrubber';

// ── Chapter definitions ────────────────────────────────────────────────────
// Progress ranges map to frame ranges in the encoded video (552 total frames):
//   hero     : frames   0–149  →  0.00–0.27
//   maritime : frames 150–299  →  0.27–0.54
//   port     : frames 300–430  →  0.54–0.78
//   air      : frames 431–513  →  0.78–0.93
//   cta      : frames 514–551  →  0.93–1.00
const CHAPTERS = [
  {
    id: 'hero',
    from: 0.00, to: 0.27,
    eyebrow: 'BEJOICE GROUP',
    headline: 'UNLEASH\nGLOBAL TRADE.',
    body: 'Move cargo faster. Pay less. Sea, air, road & customs — with zero delays and a 30-minute quote guarantee.',
    align: 'left',
    isHero: true,
  },
  {
    id: 'maritime',
    from: 0.27, to: 0.54,
    eyebrow: 'OCEAN FREIGHT',
    headline: 'MASTERS OF\nTHE DEEP BLUE.',
    body: 'FCL · LCL · Reefer · OOG. Every vessel type, every trade lane — KSA covered.',
    align: 'right',
  },
  {
    id: 'port',
    from: 0.54, to: 0.78,
    eyebrow: 'PORT & CUSTOMS',
    headline: 'PORT-READY.\nPRE-CLEARED.',
    body: 'Jeddah · Dammam · King Fahd Port. ZATCA-aligned, zero-delay customs clearance.',
    align: 'left',
  },
  {
    id: 'air',
    from: 0.78, to: 0.93,
    eyebrow: 'AIR FREIGHT',
    headline: 'WHEELS UP.\nON TIME.',
    body: 'Direct uplift to RUH · JED · DMM. Express, cold-chain or oversized — same precision.',
    align: 'right',
  },
  {
    id: 'cta',
    from: 0.93, to: 1.00,
    eyebrow: 'END-TO-END',
    headline: 'ONE PARTNER.\nEVERY MILE.',
    body: 'No hand-offs. No surprises. Bejoice Group — your Saudi logistics bridge.',
    align: 'center',
    hasCTA: true,
  },
];

function getActiveChapter(progress) {
  return [...CHAPTERS].reverse().find(c => progress >= c.from) ?? CHAPTERS[0];
}

export function ScrollytellingHero() {
  const { canvasRef, containerRef, isReady, progress } = useVideoScrubber({ scrollMultiplier: 5 });
  const chapter    = getActiveChapter(progress);
  const prevKeyRef = useRef(chapter.id);
  const isNew      = prevKeyRef.current !== chapter.id;
  if (isNew) prevKeyRef.current = chapter.id;

  const textClass = `scrolly-text scrolly-text--${chapter.align}`;

  return (
    <div
      ref={containerRef}
      className="scrolly-container"
      style={{ height: '500vh' }}
      aria-label="Bejoice Group — scrollytelling hero"
    >
      {/* ── Sticky viewport ───────────────────────────────────────────── */}
      <div className="scrolly-sticky">

        {/* Poster — instant first paint while video loads */}
        <img
          src="/hero-poster.webp"
          alt="Freight vessel at sea — Bejoice Group"
          className={`scrolly-poster${isReady ? ' scrolly-poster--hidden' : ''}`}
          fetchpriority="high"
          decoding="async"
          width={1920}
          height={1080}
        />

        {/* Canvas — video frames painted here */}
        <canvas
          ref={canvasRef}
          className={`scrolly-canvas${isReady ? ' scrolly-canvas--visible' : ''}`}
          aria-hidden="true"
        />

        {/* Dark gradient overlay for text legibility */}
        <div className="scrolly-overlay" aria-hidden="true" />

        {/* Animated text — re-mounts on chapter change to trigger CSS animation */}
        <div className={textClass} key={chapter.id}>
          {chapter.eyebrow && (
            <span className="scrolly-eyebrow">{chapter.eyebrow}</span>
          )}
          <h1 className="scrolly-headline">
            {chapter.headline.split('\n').map((line, i) => (
              <span key={i} className="scrolly-headline__line">{line}</span>
            ))}
          </h1>
          <p className="scrolly-body">{chapter.body}</p>
          {chapter.hasCTA && (
            <a
              href="#quick-quote-section"
              className="scrolly-cta-btn"
              onClick={e => {
                e.preventDefault();
                document.getElementById('quick-quote-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get a Free Quote — 30 min
            </a>
          )}
        </div>

        {/* Gold progress bar along the bottom */}
        <div
          className="scrolly-progress-bar"
          style={{ width: `${progress * 100}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Story progress"
        />

        {/* Chapter dot navigation */}
        <nav className="scrolly-dots" aria-label="Story sections">
          {CHAPTERS.map(c => (
            <span
              key={c.id}
              className={`scrolly-dot${progress >= c.from ? ' scrolly-dot--active' : ''}`}
              aria-hidden="true"
            />
          ))}
        </nav>

      </div>
    </div>
  );
}
