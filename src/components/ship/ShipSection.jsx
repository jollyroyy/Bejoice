/**
 * ShipSection.jsx
 * Two chapter text overlays for the ship act (Act 2).
 * Reuses the same float-over-scene layout as warehouse chapters.
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SHIP_CHAPTERS = [
  {
    id:     'horizon',
    label:  'Prologue — The Horizon Calls',
    title:  'Every Journey\nBegins at Sea.',
    body:   'From the ports of Jeddah and Dammam to the farthest corners of the globe, Bejoice commands the deep-water lanes that move the world\'s commerce.',
    align:  'left',
  },
  {
    id:     'mastery',
    label:  'Act I — Deep Water Mastery',
    title:  'Colossal Ships.\nInvisible Hands.',
    body:   'Our maritime operations handle the full spectrum — from FCL and LCL to project cargo and oversized shipments — with the precision that only decades of expertise can deliver.',
    align:  'right',
  },
];

function ShipChapter({ chapter }) {
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

  const alignStyle = {
    left:  { alignItems: 'flex-start', paddingLeft:  'clamp(1.5rem, 8vw, 7rem)', paddingRight: '2rem' },
    right: { alignItems: 'flex-end',   paddingRight: 'clamp(1.5rem, 8vw, 7rem)', paddingLeft:  '2rem', textAlign: 'right' },
  };

  return (
    <section
      ref={sectionRef}
      id={`section-ship-${chapter.id}`}
      className="relative z-10"
      style={{
        height: '250vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '4rem',
        ...alignStyle[chapter.align],
      }}
    >
      <div ref={blockRef} className="chapter-block" style={{ opacity: 0 }}>
        <div className="chapter-label">{chapter.label}</div>
        <h2 className="section-title" style={{ whiteSpace: 'pre-line' }}>{chapter.title}</h2>
        <p className="section-body">{chapter.body}</p>
      </div>
    </section>
  );
}

export default function ShipSection() {
  return (
    <>
      {SHIP_CHAPTERS.map(ch => <ShipChapter key={ch.id} chapter={ch} />)}
    </>
  );
}
