/**
 * MagicCut.jsx
 * Cinematic transition canvas: Globe → Ship.
 * Three phases driven by progress (0 → 1):
 *   Phase 1 (0.00 → 0.35): Lens streak — horizontal gold/white gradient
 *   Phase 2 (0.25 → 0.65): White burst + chromatic aberration
 *   Phase 3 (0.55 → 1.00): Film grain dissolve
 */

import { useEffect, useRef } from 'react';

export default function MagicCut({ progress }) {
  const canvasRef  = useRef(null);
  const frameCount = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width        = Math.round(window.innerWidth  * dpr);
      canvas.height       = Math.round(window.innerHeight * dpr);
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw  = canvas.width;
    const ch  = canvas.height;
    const cx  = cw / 2;
    const cy  = ch / 2;

    ctx.clearRect(0, 0, cw, ch);

    if (progress <= 0 || progress >= 1) return;

    frameCount.current++;

    // ── Phase 1: Lens streak (progress 0 → 0.35) ──────────────────────────
    if (progress < 0.35) {
      const t = progress / 0.35; // 0 → 1
      const alpha   = Math.sin(t * Math.PI) * 0.9;
      const height  = (3 + t * 40) * (canvas.width / 1920);
      const streakGrad = ctx.createLinearGradient(0, cy, cw, cy);
      streakGrad.addColorStop(0,    `rgba(200,168,78,0)`);
      streakGrad.addColorStop(0.2,  `rgba(200,168,78,${alpha * 0.6})`);
      streakGrad.addColorStop(0.5,  `rgba(255,255,255,${alpha})`);
      streakGrad.addColorStop(0.8,  `rgba(200,168,78,${alpha * 0.6})`);
      streakGrad.addColorStop(1,    `rgba(200,168,78,0)`);
      ctx.fillStyle = streakGrad;
      ctx.fillRect(0, cy - height / 2, cw, height);
    }

    // ── Phase 2: White burst + chromatic aberration (0.25 → 0.65) ─────────
    if (progress > 0.25 && progress < 0.65) {
      const t = (progress - 0.25) / 0.40; // 0 → 1
      const burstAlpha = Math.sin(t * Math.PI) * 0.95;
      const radius     = Math.max(cw, ch) * (0.1 + t * 1.2);

      // White radial burst
      const burstGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      burstGrad.addColorStop(0,    `rgba(255,255,255,${burstAlpha})`);
      burstGrad.addColorStop(0.35, `rgba(220,240,255,${burstAlpha * 0.6})`);
      burstGrad.addColorStop(1,    `rgba(0,10,30,0)`);
      ctx.fillStyle = burstGrad;
      ctx.fillRect(0, 0, cw, ch);

      // Chromatic aberration
      const aberration = Math.sin(t * Math.PI) * 8;
      if (aberration > 0.5) {
        ctx.globalCompositeOperation = 'screen';

        // Red channel shifted right
        const redGrad = ctx.createRadialGradient(cx + aberration, cy, 0, cx + aberration, cy, radius * 0.7);
        redGrad.addColorStop(0,   `rgba(255,80,80,${burstAlpha * 0.3})`);
        redGrad.addColorStop(1,   `rgba(255,0,0,0)`);
        ctx.fillStyle = redGrad;
        ctx.fillRect(0, 0, cw, ch);

        // Blue channel shifted left
        const blueGrad = ctx.createRadialGradient(cx - aberration, cy, 0, cx - aberration, cy, radius * 0.7);
        blueGrad.addColorStop(0,   `rgba(80,80,255,${burstAlpha * 0.3})`);
        blueGrad.addColorStop(1,   `rgba(0,0,255,0)`);
        ctx.fillStyle = blueGrad;
        ctx.fillRect(0, 0, cw, ch);

        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // ── Phase 3: Film grain dissolve (0.55 → 1.00) ────────────────────────
    if (progress > 0.55) {
      const t     = (progress - 0.55) / 0.45; // 0 → 1
      const alpha = (1 - t) * 0.06; // fades out

      // Update noise every 3 frames for performance
      if (frameCount.current % 3 === 0 && alpha > 0.002) {
        const tileSize = 64;
        const offCanvas = document.createElement('canvas');
        offCanvas.width  = tileSize;
        offCanvas.height = tileSize;
        const offCtx = offCanvas.getContext('2d');
        const imgData = offCtx.createImageData(tileSize, tileSize);

        for (let i = 0; i < imgData.data.length; i += 4) {
          const v = Math.random() * 255;
          imgData.data[i]     = v;
          imgData.data[i + 1] = v;
          imgData.data[i + 2] = v;
          imgData.data[i + 3] = Math.random() * 255 * alpha * 16;
        }
        offCtx.putImageData(imgData, 0, 0);

        const pattern = ctx.createPattern(offCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, cw, ch);
        }
      }
    }
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      id="transition-canvas"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        display: progress > 0 && progress < 1 ? 'block' : 'none',
      }}
    />
  );
}
