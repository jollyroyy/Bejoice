# CLAUDE.md — Bejoice Scroll Site

## Project Overview
Cinematic scrollytelling site for Bejoice Group (Saudi logistics).
**Migration in progress:** JPEG frame sequences → Apple-style video scrubbing on canvas.
Below the scroll: **TrustStrip → SaudiSection → RouteMap → HowItWorks → Quick Quote → CaseStudies → ClientLogos → Freight Tools → SiteFooter**.

**Stack:** React 19 · Vite · GSAP + ScrollTrigger · Lenis · Tailwind CSS 4

---

## Video Scrubbing Architecture (NEW — replaces JPEG sequences)

### Frame sources (current)
| Folder | Frames | Global index |
|--------|--------|-------------|
| `public/frames-hero/` | 300 | 0–299 |
| `public/frames-new/`  | 176 | 300–475 |
| `public/frames-mid/`  |  76 | 476–551 |
| **Total**             | **552** | — |

### Video files needed in `public/`
```
hero.webm        — VP9, CRF 18, 1920px wide  (~8–12 MB, near-lossless)
hero.mp4         — H.264, CRF 18, -tune stillimage (~8–12 MB, Safari fallback)
hero-poster.webp — First frame as WebP, ~30 KB (instant first paint)
```

### Encode commands (run once from project root, requires ffmpeg in PATH)
```bash
# WebM (VP9) — two-pass, CRF 18 near-lossless
ffmpeg -framerate 30 -i public/frames-hero/ezgif-frame-%03d.jpg \
  -c:v libvpx-vp9 -crf 18 -b:v 0 -vf "scale=1920:-2" -pix_fmt yuv420p \
  -row-mt 1 -pass 1 -an -f null /dev/null && \
ffmpeg -framerate 30 -i public/frames-hero/ezgif-frame-%03d.jpg \
  -c:v libvpx-vp9 -crf 18 -b:v 0 -vf "scale=1920:-2" -pix_fmt yuv420p \
  -row-mt 1 -pass 2 -an public/hero.webm

# MP4 (H.264) — Safari fallback, -tune stillimage for frame-by-frame content
ffmpeg -framerate 30 -i public/frames-hero/ezgif-frame-%03d.jpg \
  -c:v libx264 -crf 18 -preset veryslow -tune stillimage \
  -vf "scale=1920:-2" -pix_fmt yuv420p -movflags +faststart -an \
  public/hero.mp4

# Poster — first frame as WebP (~30KB)
ffmpeg -i public/frames-hero/ezgif-frame-001.jpg \
  -vf "scale=1920:-2" -quality 85 public/hero-poster.webp
```

> **Note:** Commands above only encode `frames-hero` (300 frames). For the full 552-frame sequence, concatenate all three frame sets into a single ffmpeg input list first, or encode each set separately and concatenate the videos.

### New files created
```
src/hooks/useVideoScrubber.js         — Core engine: video + canvas + scroll driver
src/components/ScrollytellingHero.jsx — Drop-in scrolly section with chapters
src/styles/scrollytelling.css         — All scrolly UI styles
public/sw.js                          — Service worker: video cache-first, SW cache repeat visits
```

### Chapter → progress mapping (552 frames total)
| Chapter | Frames | Progress |
|---------|--------|---------|
| hero     | 0–149   | 0.00–0.27 |
| maritime | 150–299 | 0.27–0.54 |
| port     | 300–430 | 0.54–0.78 |
| air      | 431–513 | 0.78–0.93 |
| cta      | 514–551 | 0.93–1.00 |

### Canvas quality rules
- `ctx.imageSmoothingQuality = 'high'` always
- `canvas.width/height` set in **physical pixels** (`w * dpr`)
- `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` — NOT `ctx.scale()` (avoids cumulative scale bug)
- `desynchronized: true` on context — lower compositing latency
- DPR capped at 2 — no 3x on high-end Android

### Integration into App.jsx
Replace the existing canvas/JPEG scroll section with `<ScrollytellingHero />`.
Import `scrollytelling.css` in App.jsx or index.css.
The post-scroll sections (TrustStrip, SaudiSection, etc.) remain unchanged below.

---

## Three-Act Architecture

```
Act 1 — Global to Sea (frames 0–149)
  └── 150 JPEGs from public/final_gif/
  └── Sea/Port logistics operations

ActDivider 1 — "Now, We Take Flight."
  └── Transition between maritime and air freight

Act 2 — Taking Flight (frames 150–349)
  └── 200 JPEGs from public/flight/
  └── High-altitude airborne logistics sequence

ActDivider 2 — "The Final Mile Awaits."
  └── Transition between airborne and last-mile delivery

Act 3 — The Final Mile (frames 350–648)
  └── 299 JPEGs from public/delivery/
  └── KSA port arrival, customs, and Saudi-wide delivery
```

---

## Frame URL Logic

```js
const FINAL_GIF_FRAMES = 150;
const FLIGHT_FRAMES    = 200;
const DELIVERY_FRAMES  = 299;
const TOTAL_FRAMES     = 649;

const FRAME_URL = (globalIndex) => {
  if (globalIndex < FINAL_GIF_FRAMES) {
    const n = (globalIndex + 1).toString().padStart(3, '0');
    return `/final_gif/ezgif-frame-${n}.jpg`;
  } else if (globalIndex < FINAL_GIF_FRAMES + FLIGHT_FRAMES) {
    const n = (globalIndex - FINAL_GIF_FRAMES + 1).toString().padStart(3, '0');
    return `/flight/ezgif-frame-${n}.jpg`;
  } else {
    const n = (globalIndex - (FINAL_GIF_FRAMES + FLIGHT_FRAMES) + 1).toString().padStart(3, '0');
    return `/delivery/ezgif-frame-${n}.jpg`;
  }
};
```

---

## Progressive Image Loading

Site becomes interactive after the first **20 frames** load (critical path), then streams the remaining 380 in the background. `isLoaded` is set to `true` after the critical batch — do not increase CRITICAL beyond ~20 or perceived load time regresses.

```js
const CRITICAL = 20; // frames loaded before site unlocks
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
| 200 | WhatsAppButton | Fixed floating bottom-right |
| 9999 | Loading screen | Covers everything while loading |

---

## Chapters

### Act 1 — Globe to Sea (frames 0–199)
| ID | Frame range | Align | Title | Special |
|----|-------------|-------|-------|---------|
| world | 0–44 | hero-row | "Unleash Global Trade" | Two-column layout; `HeroQuoteForm` on right |
| routes | 45–89 | right | "Chart the Course. Own the Ocean." | |
| horizon | 90–144 | left | "Where the Sea Becomes Strategy." | |
| maritime | 145–199 | right | "Deep Water. Deeper Trust." | Stats row |

### Act 2 — Sea to Flight (frames 200–399)
| ID | Frame range | Align | Title | Special |
|----|-------------|-------|-------|---------|
| liftoff | 200–254 | left | "Leave the Waves. Rule the Sky." | |
| airways | 255–319 | right | "Airborne. On Time. Every Time." | Stats row |
| promise | 320–399 | center + CTA | "One Partner. Every Mile." | `.cta-button-prominent` gold filled button |

---

## Hero Chapter — Two-Column Layout

The `world` chapter uses `chapter-section-hero-row` instead of the standard `chapter-section-left`:

```
[  chapter-hero-left  ]  [  chapter-hero-right  ]
  label + title + body     HeroQuoteForm (white tray)
```

- `.chapter-hero-left` has a dark gradient backdrop so "Unleash Global Trade" is always readable
- `.chapter-hero-left .section-title .title-accent` ("Trade") uses `filter: drop-shadow` for a gold glow — `text-shadow` does NOT work on `-webkit-text-fill-color: transparent` gradient text
- `.chapter-hero-right` contains `HeroQuoteForm` — a white card (`rgba(255,255,255,0.96)`) with 2 inputs (Origin → Destination) + gold CTA button + phone/WhatsApp sub-row

---

## I18n / Language System

`lang` state lives in `App` (not in `Header`). Default: `'en'`. Toggle: `'ar'`.

```js
const [lang, setLang] = useState('en');
const toggleLang = useCallback(() => { ... document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr' }, []);
```

- Passed as prop to **every component** that renders text: `Header`, `ChapterSection`, `HeroQuoteForm`, `TrustStrip`, `SaudiSection`, `RouteMap`, `HowItWorks`, `CaseStudies`, `ClientLogos`, `ShipmentTracking`, `ToolsSection`, `SiteFooter`
- All strings live in `TRANSLATIONS = { en: {...}, ar: {...} }` constant at the top of `App.jsx`
- Chapter text (label, titleLines, body) is in `TRANSLATIONS[lang].chapters[chapter.id]` — falls back to the CHAPTERS array values if key missing
- The CHAPTERS array still holds `frameStart/frameEnd/align/isHero/hasCTA/stats` — only text fields are overridden by TRANSLATIONS

---

## Post-Scroll Page Order

```
[Canvas scroll animation — unchanged]
TrustStrip            — 4 trust badges horizontal row
SaudiSection          — headline + bullets + 3 stat cards
RouteMap              — pure SVG world map with animated dashed trade routes
HowItWorks            — 3-step process cards
QuickQuoteSection     — 5-tab multi-step form (id="quick-quote-section")
CaseStudies           — 3 shipment example cards
ClientLogos           — infinite marquee of carrier names
ToolsSection          — CBM calculator + Air Weight + ShipmentTracking widget
SiteFooter            — 4-column footer with address, links, compliance
WhatsAppButton        — fixed bottom-right (z-index 200)
ProgressBar           — fixed top (hairline)
```

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
Defined as `BJSLogo` component in `src/App.jsx`. Reused in `SiteFooter`.

**Nav links:**
- **Quick Quote** — gold pill button → scrolls to `#quick-quote-section`
- **Tools** → scrolls to `#tools-section`
- **EN | AR** — language toggle (sets `document.documentElement.dir`)
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

Rendered after CaseStudies/ClientLogos. Three widgets:

| Tool | Logic |
|------|-------|
| **CBM Calculator** | L×W×H (cm or m) × qty per row → total CBM → container suggestion (20ft/40ft/40HC) |
| **Air Chargeable Weight** | Actual weight vs (L×W×H÷5000) → chargeable = max of both |
| **Shipment Tracking** | BL/AWB input → mock toast "Tracking in progress" with WhatsApp contact |

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
| White card | `rgba(255,255,255,0.96)` | HeroQuoteForm tray background |

---

## Typography

- **Bebas Neue** — section titles, card titles, stat values, loading logo
- **Inter** (400, 500, 600) — body, labels, captions, form fields
- **Syne** — fallback for display font

Loaded from Google Fonts in `index.html`.

---

## Key File Map

```
src/App.jsx                          Main orchestration — scroll, canvas, chapters, tools, i18n
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
npm run dev          # Start dev server (Vite, default :5173+)
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
- Loading now unlocks at 20 frames (not 400) — `isLoaded=true` fires early, remaining frames stream in background
- **`text-shadow` does NOT work on gradient text** (`-webkit-text-fill-color: transparent`) — use `filter: drop-shadow()` instead (applies to `.title-accent` in the hero)
- `.chapter-hero-left` has a dark gradient backdrop for readability — `.chapter-block` (non-hero) has no background
- `QuickQuote.jsx` uses local component state only — no global state or context
- `sharedInputCls` and `labelCls` are plain JS objects (not CSS classes) — defined at top of `QuickQuote.jsx`
- `lang` state is in `App`, NOT in `Header` — pass `lang` and `toggleLang` as props to Header
- All TRANSLATIONS strings must be kept in sync between `en` and `ar` keys — same key structure required
