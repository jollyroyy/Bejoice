# CLAUDE.md — Bejoice Scroll Site

## Project Overview
Cinematic two-act scrollytelling site for Bejoice Group (Saudi logistics).
400-frame scroll animation driven by two image sequences: **Globe → Sea** and **Sea → Flight**.
Immersive parallax, mouse/gyro tracking, ambient drift, vignette, and GSAP chapter text overlays.

**Stack:** React 19 · Vite · GSAP + ScrollTrigger · Lenis · Tailwind CSS 4

---

## Two-Act Architecture

```
Act 1 — Globe to Sea (frames 0–199)
  └── 200 JPEGs from public/globe-sea/ezgif-frame-001..200.jpg
  └── 4 chapter text overlays (left/right alternating)

ActDivider — "Now, We Take Flight." (1 × 100vh section)
  └── Cinematic title card between acts, fade in/out on scroll

Act 2 — Sea to Flight (frames 200–399)
  └── 200 JPEGs from public/sea-flight/ezgif-frame-001..200.jpg
  └── 3 chapter text overlays, last has CTA button
```

---

## Frame URL Logic

```js
const GLOBE_SEA_FRAMES  = 200;
const SEA_FLIGHT_FRAMES = 200;
const TOTAL_FRAMES = 400;

const FRAME_URL = (globalIndex) => {
  if (globalIndex < GLOBE_SEA_FRAMES) {
    return `/globe-sea/ezgif-frame-${(globalIndex + 1).toString().padStart(3,'0')}.jpg`;
  } else {
    return `/sea-flight/ezgif-frame-${(globalIndex - 200 + 1).toString().padStart(3,'0')}.jpg`;
  }
};
```

---

## Canvas Layer Z-Index Stack

| z-index | Element | Role |
|---------|---------|------|
| 1 | `.canvas-container` | 2D canvas — all 400 frames paint here |
| 10+ | Chapter `<section>` elements | Text overlays |
| 50 | Progress bar | Hairline scroll indicator |
| 60 | ActIndicator pill | Floating act label (fades in on act change) |
| 100 | Header | Fixed top navigation |
| 9999 | Loading screen | Covers everything while loading |

---

## Chapters

### Act 1 — Globe to Sea (frames 0–199)
| ID | Frame range | Align |
|----|-------------|-------|
| world | 0–44 | left |
| routes | 45–89 | right |
| horizon | 90–144 | left |
| maritime | 145–199 | right |

### Act 2 — Sea to Flight (frames 200–399)
| ID | Frame range | Align |
|----|-------------|-------|
| liftoff | 200–254 | left |
| airways | 255–319 | right |
| promise | 320–399 | center + CTA |

---

## Critical Performance Rules

1. **No `ctx.filter`** on drawFrame — causes intermediate compositing buffer → blur
2. **No `ctx.scale(dpr, dpr)`** — canvas sized in physical pixels directly (`canvas.width = w * dpr`)
3. **Frame indices**: always `Math.round()` not `Math.floor()`
4. **Lenis + ScrollTrigger sync must remain**: `lenis.on('scroll', ScrollTrigger.update)`
5. **RAF loop always running** — redraws every frame for ambient drift even without scroll
6. **Parallax clamped to bleed margin** — image never reveals canvas background at any mouse position
7. **imagesRef is a flat array of 400 Image objects** — index = global frame index

---

## Immersive Parallax System

- **Mouse:** normalised `[-1, 1]` → lerped at 4% per frame → ±12px physical pixel offset
- **Gyroscope (mobile):** `DeviceOrientationEvent` gamma/beta → same pipeline
- **Ambient drift:** dual sine/cosine at different frequencies — subtle breathing motion
- **Vignette:** radial gradient overlay drawn after every frame, no ctx.filter

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Deep black | `#0a0a0f` | Body background |
| Deeper black | `#050508` | Canvas fallback |
| Gold | `#c8a84e` | Accents, act indicator border |
| Gold light | `#e8d48a` | Hover states |

---

## Typography

- **Syne** (900, 800, 600) — headings, wordmark
- **Inter** (300, 400, 500) — body, labels, captions

Loaded from Google Fonts in `index.html`.

---

## Key File Map

```
src/App.jsx                          Main orchestration — all scroll, canvas, chapters
src/index.css                        z-index stack, canvas styles, typography, loading screen
public/globe-sea/                    200 JPEG frames — Act 1 (Globe → Sea)
public/sea-flight/                   200 JPEG frames — Act 2 (Sea → Flight)
public/frames/                       161 legacy warehouse frames (unused in current build)
public/ship-frames/                  40 legacy ship frames (unused in current build)
```

---

## Dev Commands

```bash
npm run dev          # Start dev server (Vite, default :5173 or :5174)
npm run build        # Production build → dist/
npm run preview      # Preview built site
```

---

## Source Assets

Frame sequences extracted from:
- `../globe to sea.zip` → 200 JPEGs (ezgif-frame-001..200)
- `../sea to flight.zip` → 200 JPEGs (ezgif-frame-001..200)

Both zips are in `C:/Users/ASUS/Desktop/Interactive Websit for Bejoice/`.

---

## Known Gotchas

- Body strings in CHAPTERS array must use **double quotes or template literals** — never single quotes with apostrophes (parser error)
- `ActIndicator` uses React state `currentAct` (1 or 2) — this is the only state that triggers re-render on scroll (single setState call per act boundary crossing, not per frame)
- Loading completes when all 400 images fire `onload` or `onerror` — errors are silently counted so a missing frame never blocks the site
