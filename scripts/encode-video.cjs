/**
 * encode-video.cjs
 * Converts frames-hero/*.jpg → hero.webm + hero.mp4 + hero-poster.webp
 * Uses the bundled ffmpeg-static binary so no system ffmpeg needed.
 *
 * Run: node scripts/encode-video.cjs
 */

const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

// ── Paths ─────────────────────────────────────────────────────────────────
const ffmpeg   = require('ffmpeg-static');
const ROOT     = path.resolve(__dirname, '..');
const FRAMES   = path.join(ROOT, 'public', 'frames-hero', 'ezgif-frame-%03d.jpg');
const OUT_DIR  = path.join(ROOT, 'public');

const WEBM     = path.join(OUT_DIR, 'hero.webm');
const MP4      = path.join(OUT_DIR, 'hero.mp4');
const POSTER   = path.join(OUT_DIR, 'hero-poster.webp');
const PASS_LOG = path.join(OUT_DIR, 'ffmpeg2pass');

// ── Helpers ───────────────────────────────────────────────────────────────
function run(label, cmd) {
  console.log(`\n⏳  ${label}…`);
  console.log('CMD:', cmd);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅  ${label} done`);
  } catch (err) {
    console.error(`❌  ${label} FAILED:`, err.message);
    process.exit(1);
  }
}

function sizeMB(filepath) {
  if (!fs.existsSync(filepath)) return '(missing)';
  return (fs.statSync(filepath).size / 1024 / 1024).toFixed(1) + ' MB';
}

// ── 1. WebM VP9 — two-pass, CRF 18 (visually lossless) ───────────────────
// Pass 1 (analysis only — no output file needed)
run('WebM VP9 pass-1', [
  `"${ffmpeg}"`,
  `-framerate 30`,
  `-i "${FRAMES}"`,
  `-c:v libvpx-vp9`,
  `-crf 18 -b:v 0`,
  `-vf "scale=1920:-2"`,
  `-pix_fmt yuv420p`,
  `-row-mt 1`,
  `-pass 1 -passlogfile "${PASS_LOG}"`,
  `-an -f null NUL`,   // Windows: NUL instead of /dev/null
].join(' '));

// Pass 2 (encode)
run('WebM VP9 pass-2', [
  `"${ffmpeg}"`,
  `-framerate 30`,
  `-i "${FRAMES}"`,
  `-c:v libvpx-vp9`,
  `-crf 18 -b:v 0`,
  `-vf "scale=1920:-2"`,
  `-pix_fmt yuv420p`,
  `-row-mt 1`,
  `-pass 2 -passlogfile "${PASS_LOG}"`,
  `-an`,
  `-y "${WEBM}"`,
].join(' '));

// ── 2. MP4 H.264 — CRF 18, veryslow preset, stillimage tuning ─────────────
run('MP4 H.264', [
  `"${ffmpeg}"`,
  `-framerate 30`,
  `-i "${FRAMES}"`,
  `-c:v libx264`,
  `-crf 18`,
  `-preset veryslow`,
  `-tune stillimage`,
  `-vf "scale=1920:-2"`,
  `-pix_fmt yuv420p`,
  `-movflags +faststart`,
  `-an`,
  `-y "${MP4}"`,
].join(' '));

// ── 3. WebP poster from first frame ───────────────────────────────────────
const FIRST_FRAME = path.join(ROOT, 'public', 'frames-hero', 'ezgif-frame-001.jpg');
run('WebP poster', [
  `"${ffmpeg}"`,
  `-i "${FIRST_FRAME}"`,
  `-vf "scale=1920:-2"`,
  `-quality 85`,
  `-y "${POSTER}"`,
].join(' '));

// Clean up pass log files
['ffmpeg2pass-0.log', 'ffmpeg2pass-0.log.mbtree'].forEach(f => {
  const fp = path.join(OUT_DIR, f);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
});

// ── Summary ───────────────────────────────────────────────────────────────
console.log('\n── Output sizes ──────────────────────────────────────');
console.log('hero.webm       :', sizeMB(WEBM));
console.log('hero.mp4        :', sizeMB(MP4));
console.log('hero-poster.webp:', sizeMB(POSTER));
console.log('─────────────────────────────────────────────────────\n');
console.log('🎉  All done! Videos are ready in public/');
