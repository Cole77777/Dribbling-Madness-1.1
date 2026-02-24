#!/usr/bin/env node
/**
 * Resize iPhone screenshots to App Store required dimensions.
 * Usage: node scripts/resize-screenshots.js <input-folder> [output-folder]
 *
 * Accepts: 1242×2688, 2688×1242, 1284×2778, 2778×1284 (portrait + landscape)
 * Output: same dimensions, saved with -1242x2688 etc. suffix.
 */

const fs = require('fs');
const path = require('path');

const DIMS = [
  [1242, 2688],  // portrait 6.5"
  [2688, 1242],  // landscape 6.5"
  [1284, 2778],  // portrait 6.7"
  [2778, 1284],  // landscape 6.7"
];

async function resize(imagePath, width, height, outPath) {
  try {
    const sharp = require('sharp');
    await sharp(imagePath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .toFile(outPath);
    return true;
  } catch (e) {
    console.error('sharp failed:', e.message);
    return false;
  }
}

async function main() {
  const inputDir = process.argv[2] || path.join(__dirname, '../screenshots');
  const outputDir = process.argv[3] || inputDir;

  if (!fs.existsSync(inputDir)) {
    console.error('Input folder not found:', inputDir);
    console.error('Usage: node scripts/resize-screenshots.js <input-folder> [output-folder]');
    process.exit(1);
  }
  fs.mkdirSync(outputDir, { recursive: true });

  const ext = /\.(png|jpg|jpeg)$/i;
  const files = fs.readdirSync(inputDir).filter((f) => ext.test(f));
  if (files.length === 0) {
    console.error('No PNG/JPEG files in', inputDir);
    process.exit(1);
  }

  for (const [w, h] of DIMS) {
    const label = `${w}x${h}`;
    for (const file of files) {
      const base = path.basename(file, path.extname(file));
      const outName = `${base}-${label}.png`;
      const outPath = path.join(outputDir, outName);
      const inPath = path.join(inputDir, file);
      console.log('Resizing', file, '->', outName);
      const ok = await resize(inPath, w, h, outPath);
      if (!ok) process.exit(1);
    }
  }
  console.log('Done. Output in', outputDir);
}

main();
