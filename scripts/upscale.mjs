/**
 * Upscale all frames to 4K (3840×2160) with maximum quality and HDR-like sharpening.
 * Uses sharp's Lanczos3 kernel — best resampling for photo-realistic upscaling.
 *
 * Run: node scripts/upscale.mjs
 */
import sharp from 'sharp';
import { readdirSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

const FOLDERS = [
  { src: 'public/frames-hero', dst: 'public/frames-hero' },
  { src: 'public/frames-new',  dst: 'public/frames-new'  },
];

const TARGET_W = 3840;
const TARGET_H = 2160;

async function processFile(srcPath) {
  const tmpPath = srcPath + '.tmp.jpg';

  await sharp(srcPath)
    // Upscale to 4K with Lanczos3 — highest quality kernel
    .resize(TARGET_W, TARGET_H, {
      fit: 'fill',
      kernel: sharp.kernel.lanczos3,
      fastShrinkOnLoad: false,
    })
    // Sharpening: sigma=1.2, flat=0.5, jagged=0.8
    // Pulls out edge detail lost during GIF→JPEG conversion
    .sharpen({ sigma: 1.2, m1: 0.5, m2: 0.8 })
    // Slight contrast + saturation boost for HDR-like look
    .modulate({ brightness: 1.0, saturation: 1.18 })
    .linear(1.08, -(0.08 * 128))   // contrast: scale factor + offset
    // MozJPEG encoder, quality 92, progressive, 4:2:0 chroma
    .jpeg({
      quality: 92,
      progressive: true,
      mozjpeg: true,
      chromaSubsampling: '4:2:0',
    })
    .toFile(tmpPath);

  // Atomic replace
  const { renameSync } = await import('fs');
  renameSync(tmpPath, srcPath);
}

async function run() {
  for (const { src, dst } of FOLDERS) {
    if (!existsSync(src)) { console.log(`Skipping ${src} — not found`); continue; }
    if (!existsSync(dst)) mkdirSync(dst, { recursive: true });

    const files = readdirSync(src)
      .filter(f => f.toLowerCase().endsWith('.jpg'))
      .sort();

    console.log(`\n📂 ${src} — ${files.length} frames`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const srcPath = join(src, file);
      process.stdout.write(`\r  [${i + 1}/${files.length}] ${file}    `);
      await processFile(srcPath);
    }
    console.log(`\n  ✓ Done`);
  }
  console.log('\n🎬 All frames upscaled to 4K — 3840×2160, MozJPEG q92\n');
}

run().catch(err => { console.error(err); process.exit(1); });
