# CLAUDE.md — Bejoice Scroll Site

## Project Overview
Cinematic two-act scrollytelling site for Bejoice Group (Saudi logistics).
400-frame scroll animation driven by two image sequences: **Globe → Sea** and **Sea → Flight**.
Immersive parallax, mouse/gyro tracking, ambient drift, vignette, and GSAP chapter text overlays.
Below the scroll: **Quick Quote section** (5 cargo types) + **Freight Tools** (CBM + Air Weight calculators).

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
  └── 3 chapter text overlays, last has CTA → scrolls to Quick Quote
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
| ID | Frame range | Align | Title |
|----|-------------|-------|-------|
| world | 0–44 | left (hero) | "Unleash Global Trade" |
| routes | 45–89 | right | "Chart the Course. Own the Ocean." |
| horizon | 90–144 | left | "Where the Sea Becomes Strategy." |
| maritime | 145–199 | right | "Deep Water. Deeper Trust." |

### Act 2 — Sea to Flight (frames 200–399)
| ID | Frame range | Align | Title |
|----|-------------|-------|-------|
| liftoff | 200–254 | left | "Leave the Waves. Rule the Sky." |
| airways | 255–319 | right | "Airborne. On Time. Every Time." |
| promise | 320–399 | center + CTA | "One Partner. Every Mile." |

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

## GSAP Opacity Pattern (critical)

- `ChapterSection` block starts with `style={{ opacity: 0 }}` inline
- **Hero**: `block.style.opacity = '1'` immediately, then `gsap.fromTo(children, ...)` time-based
- **Non-hero**: `gsap.fromTo(block, { opacity:0, y:40 }, { opacity:1, y:0 })` via ScrollTrigger scrub
- **Bug to avoid**: Never animate only `children` — parent block stays at `opacity:0` and hides everything

---

## Immersive Parallax System

- **Mouse:** normalised `[-1, 1]` → lerped at 4% per frame → ±12px physical pixel offset
- **Gyroscope (mobile):** `DeviceOrientationEvent` gamma/beta → same pipeline
- **Ambient drift:** dual sine/cosine at different frequencies — subtle breathing motion
- **Vignette:** radial gradient overlay drawn after every frame, no ctx.filter

---

## Header — BJS Wing Logo

Inline SVG bird-wing emblem (3-feather layers, gold gradient) + "BEJOICE" / "GROUP" wordmark.
Defined as `BJSLogo` component in `src/App.jsx`.

**Nav links:**
- **Quick Quote** — gold pill button → scrolls to `#quick-quote-section`
- **Tools** → scrolls to `#tools-section`
- **Contact** → placeholder button (right side)

---

## Quick Quote Section (`src/QuickQuote.jsx`)

5-tab multi-step quote form, rendered below the scroll container.

| Tab | Steps | Key features |
|-----|-------|-------------|
| 🚢 Sea Freight | 4 | FCL/LCL toggle, container types (20ft–40HC–Reefer–Flatrack), port list, hazardous, reefer temp |
| ✈️ Air Freight | 4 | Airport pairs, cargo category, live chargeable weight preview (actual vs vol ÷5000), service level |
| 🚛 Land Freight | 3 | FTL/LTL, truck type, Saudi + GCC cities, pallets/CBM/weight |
| 🏛️ Customs Clearance | 4 | Import/Export, all KSA ports/airports, HS code, duty payment + SASO inspection add-ons |
| ⚙️ Project Cargo | 3 | OOG/heavy lift types, metre-scale dimensions, crane/escort/permits toggles |

- Shared: `StepIndicator`, service add-on cards, `ContactStep`, `SuccessState`
- On submit: 1.4s simulated loading → success state (no backend)
- `id="quick-quote-section"` — targeted by header nav + scroll CTA

---

## Freight Tools Section (`src/App.jsx` — `ToolsSection`)

Rendered after Quick Quote section. Two calculator cards:

| Tool | Logic |
|------|-------|
| **CBM Calculator** | L×W×H (cm or m) × qty per row → total CBM → container suggestion (20ft/40ft/40HC) |
| **Air Chargeable Weight** | Actual weight vs (L×W×H÷5000) → chargeable = max of both |

- `id="tools-section"` — targeted by "Tools" nav link

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Deep black | `#0a0a0f` | Body background |
| Deeper black | `#050508` | Canvas fallback |
| Gold | `#c8a84e` | Accents, borders, active states |
| Gold light | `#e8d48a` | Hover, result values |
| Gold dark | `#a8843e` | Gradient end stop |

---

## Typography

- **Bebas Neue** — section titles, card titles, stat values, loading logo
- **Inter** (400, 500, 600) — body, labels, captions, form fields
- **Syne** — fallback for display font

Loaded from Google Fonts in `index.html`.

---

## Key File Map

```
src/App.jsx                          Main orchestration — scroll, canvas, chapters, tools
src/QuickQuote.jsx                   5-tab Quick Quote multi-step form
src/index.css                        All styles — scroll, tools, quick quote, responsive
public/globe-sea/                    200 JPEG frames — Act 1 (Globe → Sea)
public/sea-flight/                   200 JPEG frames — Act 2 (Sea → Flight)
public/frames/                       161 legacy warehouse frames (unused)
public/ship-frames/                  40 legacy ship frames (unused)
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
- `ActIndicator` uses React state `currentAct` (1 or 2) — only state that triggers re-render on scroll
- Loading completes when all 400 images fire `onload` or `onerror` — missing frames never block the site
- `.chapter-block` has **no background** — text visibility relies on `text-shadow` alone
- `QuickQuote.jsx` uses local component state only — no global state or context
- `sharedInputCls` and `labelCls` are plain JS objects (not CSS classes) — defined at top of `QuickQuote.jsx`
