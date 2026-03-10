import sharp from 'sharp';
import { readdir } from 'fs/promises';
import path from 'path';

// Watermark sits in bottom-right ~220x55 pixels on 1920x1080 frames
// We sample a patch from just to the left of the watermark and paste it over
const IMG_W = 1920;
const IMG_H = 1080;

// Watermark region (covers both Veo and KlingAI logos — KlingAI icon starts ~350px from right)
const WM_W = 380;
const WM_H = 70;
const WM_X = IMG_W - WM_W;   // 1540
const WM_Y = IMG_H - WM_H;   // 1010

// Source patch — same size, sampled from just left of watermark
const PATCH_X = WM_X - WM_W; // 1160
const PATCH_Y = WM_Y;

async function processFolder(folderPath) {
  const files = (await readdir(folderPath))
    .filter(f => f.endsWith('.jpg'))
    .sort();

  console.log(`Processing ${files.length} frames in ${path.basename(folderPath)}...`);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const img = sharp(filePath);

    // Extract the patch from just left of watermark
    const patch = await img
      .clone()
      .extract({ left: PATCH_X, top: PATCH_Y, width: WM_W, height: WM_H })
      .toBuffer();

    // Composite patch over the watermark area and overwrite
    await sharp(filePath)
      .composite([{ input: patch, left: WM_X, top: WM_Y }])
      .jpeg({ quality: 92 })
      .toFile(filePath + '.tmp');

    // Atomic replace
    const { rename } = await import('fs/promises');
    await rename(filePath + '.tmp', filePath);
  }

  console.log(`✓ Done — ${files.length} frames cleaned`);
}

const base = './public';
await processFolder(path.join(base, 'final_gif'));
await processFolder(path.join(base, 'flight'));
await processFolder(path.join(base, 'delivery'));

console.log('\n✅ All watermarks removed.');
