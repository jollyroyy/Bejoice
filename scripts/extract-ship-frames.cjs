/**
 * extract-ship-frames.cjs
 * Extracts frames from "sea cargo.mp4" → public/ship-frames/ship-frame-NNN.jpg
 *
 * Usage: node scripts/extract-ship-frames.cjs
 *
 * Requirements: npm install --save-dev fluent-ffmpeg ffmpeg-static sharp
 * (no system ffmpeg needed — uses the bundled binary from ffmpeg-static)
 */

const path    = require('path');
const fs      = require('fs');
const os      = require('os');
const sharp   = require('sharp');
const ffmpeg  = require('fluent-ffmpeg');
const ffmpegBin = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegBin);

const PROJECT_ROOT = path.join(__dirname, '..');
const VIDEO_PATH   = path.join(PROJECT_ROOT, '..', 'sea cargo.mp4');
const OUT_DIR      = path.join(PROJECT_ROOT, 'public', 'ship-frames');
const TEMP_DIR     = path.join(os.tmpdir(), 'ship-raw-frames');
const FPS          = 8;
const OUT_W        = 3840;
const OUT_H        = 2160;

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function extractRawFrames() {
  await ensureDir(TEMP_DIR);
  // Clean temp dir first
  fs.readdirSync(TEMP_DIR).forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));

  return new Promise((resolve, reject) => {
    console.log(`Extracting frames at ${FPS}fps from:\n  ${VIDEO_PATH}\n`);
    ffmpeg(VIDEO_PATH)
      .fps(FPS)
      .output(path.join(TEMP_DIR, 'raw-%04d.jpg'))
      .outputOptions(['-q:v 2'])
      .on('progress', (p) => {
        if (p.frames) process.stdout.write(`\r  ffmpeg: ${p.frames} frames extracted`);
      })
      .on('end', () => {
        console.log('\n  ffmpeg extraction complete.');
        const files = fs.readdirSync(TEMP_DIR)
          .filter(f => /^raw-\d+\.jpg$/.test(f))
          .sort();
        resolve(files);
      })
      .on('error', reject)
      .run();
  });
}

async function processFrame(rawPath, outPath) {
  await sharp(rawPath)
    .resize(OUT_W, OUT_H, {
      fit:      'cover',
      position: 'centre',
      kernel:   'lanczos3',
    })
    // Maritime grade: slightly cooler + richer than warehouse
    .modulate({ brightness: 1.05, saturation: 1.25 })
    .linear(1.12, -(128 * 0.12))
    // Subtle cool blue tint — blends as additive offset
    .recomb([
      [1.004, 0,     0.004],
      [0,     1.007, 0.007],
      [0.004, 0.007, 1.012],
    ])
    .sharpen({ sigma: 1.4, m1: 1.2, m2: 2.5, x1: 2, y2: 10, y3: 20 })
    .jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(outPath);
}

async function main() {
  if (!fs.existsSync(VIDEO_PATH)) {
    console.error(`\n✗ Video not found: ${VIDEO_PATH}`);
    console.error('  Expected "sea cargo.mp4" in the parent of bejoice-scroll/');
    process.exit(1);
  }

  await ensureDir(OUT_DIR);
  await ensureDir(TEMP_DIR);

  const rawFiles = await extractRawFrames();
  const total = rawFiles.length;
  console.log(`\nProcessing ${total} raw frames → 4K with maritime grade...\n`);

  const BATCH = 4;
  let done = 0;
  for (let i = 0; i < rawFiles.length; i += BATCH) {
    const batch = rawFiles.slice(i, i + BATCH);
    await Promise.all(batch.map((file, j) => {
      const idx = i + j + 1;
      const rawPath = path.join(TEMP_DIR, file);
      const outPath = path.join(OUT_DIR, `ship-frame-${String(idx).padStart(3,'0')}.jpg`);
      return processFrame(rawPath, outPath);
    }));
    done += batch.length;
    process.stdout.write(`\r  ${done}/${total}`);
  }

  // Write manifest so the app knows how many frames exist
  const manifest = { count: total, fps: FPS, extractedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // Clean temp
  fs.readdirSync(TEMP_DIR).forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));
  fs.rmdirSync(TEMP_DIR);

  console.log(`\n\n✓ Done. ${total} ship frames in public/ship-frames/`);
  console.log(`  manifest.json written — SHIP_FRAMES count: ${total}`);
}

main().catch(e => { console.error('\n✗', e.message); process.exit(1); });
