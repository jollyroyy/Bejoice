/**
 * convert-frames.cjs
 * Converts portrait originals (720×1280) → 4K landscape (3840×2160)
 *
 * Upsampling to 4K with Lanczos3 + unsharp mask gives a crisp result that
 * looks sharp on any screen including retina/HiDPI displays.
 *
 * Method: scale to fill width (3840), centre-crop height to 2160.
 */

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const ORIGINALS_DIR = path.join(__dirname, '..');
const FRAMES_DIR    = path.join(__dirname, 'public', 'frames');
const OUT_W = 3840;
const OUT_H = 2160;

async function convertFrame(filename) {
  const src = path.join(ORIGINALS_DIR, filename);
  const dst = path.join(FRAMES_DIR, filename);

  if (!fs.existsSync(src)) {
    console.warn(`  ⚠ skipping ${filename}`);
    return;
  }

  await sharp(src)
    .resize(OUT_W, OUT_H, {
      fit:      'cover',
      position: 'centre',   // show full width; crop excess height at centre
      kernel:   'lanczos3',
    })
    // HDR-style grade baked in — no canvas filter needed
    .modulate({ brightness: 1.05, saturation: 1.25 })
    .linear(1.12, -(128 * 0.12))   // contrast lift (equivalent of contrast(1.12))
    // Unsharp mask — restores crispness after upscale
    .sharpen({ sigma: 1.4, m1: 1.2, m2: 2.5, x1: 2, y2: 10, y3: 20 })
    .jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(dst);
}

async function main() {
  const files = fs.readdirSync(ORIGINALS_DIR)
    .filter(f => /^ezgif-frame-\d+\.jpg$/i.test(f))
    .sort();

  if (!files.length) { console.error('No originals found in', ORIGINALS_DIR); process.exit(1); }

  console.log(`Converting ${files.length} frames → ${OUT_W}×${OUT_H} 4K landscape`);
  console.log(`Source : ${ORIGINALS_DIR}`);
  console.log(`Output : ${FRAMES_DIR}\n`);

  const BATCH = 6;
  let done = 0;
  for (let i = 0; i < files.length; i += BATCH) {
    await Promise.all(files.slice(i, i + BATCH).map(convertFrame));
    done += Math.min(BATCH, files.length - i);
    process.stdout.write(`\r  ${done}/${files.length}`);
  }
  console.log('\n✓ Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
