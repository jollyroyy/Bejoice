/**
 * GlobeText.jsx
 * Hero text overlay that sits above the globe canvas during Act 1.
 * Fades in as globe begins, fades out before the transition.
 * Uses ScrollTrigger for scrub-based fade.
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function GlobeText() {
  const blockRef = useRef(null);

  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;

    // Fade in: globe progress 0 → 0.08 (relative to #globe-act height)
    const enter = gsap.timeline({
      scrollTrigger: {
        trigger: '#globe-act',
        start: 'top top',
        end:   'top+=8% top',
        scrub: 1,
      },
    });
    enter.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0 });

    // Fade out: globe progress 0.75 → 1.0 within globe-act
    const exit = gsap.timeline({
      scrollTrigger: {
        trigger: '#globe-act',
        start: 'bottom-=30% bottom',
        end:   'bottom bottom',
        scrub: 1,
      },
    });
    exit.to(el, { opacity: 0, y: -30 });

    return () => {
      enter.scrollTrigger?.kill(); enter.kill();
      exit.scrollTrigger?.kill();  exit.kill();
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <div ref={blockRef} style={{ opacity: 0 }}>
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(2.5rem, 7vw, 6rem)',
          fontWeight: 900,
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          color: '#ffffff',
          marginBottom: '1.5rem',
          textShadow: '0 0 60px rgba(0,0,0,0.6)',
        }}>
          The World Moves
        </h1>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(0.85rem, 1.4vw, 1.15rem)',
          fontWeight: 300,
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.65)',
          maxWidth: '38rem',
          textShadow: '0 0 30px rgba(0,0,0,0.8)',
        }}>
          Bejoice Group connects Saudi Arabia to every port,
          every partner, every possibility.
        </p>
      </div>
    </div>
  );
}
