// src/hooks/useVideoScrubber.js
import { useEffect, useRef, useState } from 'react';

/**
 * Apple-style video scrubber.
 * Drives video.currentTime from scroll progress across a tall sticky container.
 *
 * @param {Object} options
 * @param {number} options.scrollMultiplier - How many viewport heights the sticky section spans (default: 5)
 * @returns {{ canvasRef, containerRef, isReady, progress }}
 */
export function useVideoScrubber({ scrollMultiplier = 5 } = {}) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const videoRef     = useRef(null);
  const ctxRef       = useRef(null);
  const rafRef       = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use desynchronized for lower-latency compositing
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false,
    });
    if (!ctx) return;
    ctxRef.current = ctx;

    // ── 1. Create the hidden video element ───────────────────────────────
    const video = document.createElement('video');
    video.muted      = true;
    video.playsInline = true;
    video.preload    = 'auto';
    video.style.display = 'none';

    const srcWebm = document.createElement('source');
    srcWebm.src  = '/hero.webm';
    srcWebm.type = 'video/webm';

    const srcMp4 = document.createElement('source');
    srcMp4.src  = '/hero.mp4';
    srcMp4.type = 'video/mp4';

    video.appendChild(srcWebm);
    video.appendChild(srcMp4);
    document.body.appendChild(video);
    videoRef.current = video;

    // ── 2. Draw a frame — quality-safe ────────────────────────────────────
    function drawFrame() {
      const c = canvasRef.current;
      if (!c || c.width === 0 || c.height === 0) return;
      const context = ctxRef.current;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(video, 0, 0, c.width / window.devicePixelRatio, c.height / window.devicePixelRatio);
    }

    // ── 3. Resize canvas — retina-safe ────────────────────────────────────
    function resizeCanvas() {
      const container = containerRef.current;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap 2x

      // Physical pixel dimensions — no blurriness on retina
      canvas.width  = Math.round(width  * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width  = `${width}px`;
      canvas.style.height = `${height}px`;

      // Scale context so drawImage coords stay in CSS pixels
      ctxRef.current.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame();
    }

    // ── 4. Scroll handler ─────────────────────────────────────────────────
    function onScroll() {
      const vid = videoRef.current;
      if (!vid?.duration) return;
      const container = containerRef.current;
      if (!container) return;

      const rect            = container.getBoundingClientRect();
      const totalScroll     = container.offsetHeight - window.innerHeight;
      const scrolled        = Math.max(0, Math.min(1, -rect.top / totalScroll));

      setProgress(scrolled);

      const targetTime = scrolled * vid.duration;
      if (Math.abs(vid.currentTime - targetTime) > 0.01) {
        vid.currentTime = targetTime;
      }
    }

    // ── 5. On seeked → draw on next rAF ───────────────────────────────────
    function onSeeked() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(drawFrame);
    }

    // ── 6. Mark ready once video is playable ──────────────────────────────
    function onCanPlay() {
      resizeCanvas();
      drawFrame();
      setIsReady(true);
    }

    video.addEventListener('canplay', onCanPlay, { once: true });
    video.addEventListener('seeked',  onSeeked);
    video.load();

    window.addEventListener('scroll', onScroll,     { passive: true });
    window.addEventListener('resize', resizeCanvas, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resizeCanvas);
      video.removeEventListener('seeked', onSeeked);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      video.remove();
    };
  }, []);

  return { canvasRef, containerRef, isReady, progress };
}
