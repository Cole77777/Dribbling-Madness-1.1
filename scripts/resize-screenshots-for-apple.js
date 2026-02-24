#!/usr/bin/env node
/**
 * Resize screenshots to 1280×800 (e.g. for App Store).
 * Usage: node scripts/resize-screenshots-for-apple.js <file1> <file2> ...
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '../screenshots-apple');
const W = 1280;
const H = 800;

async function resizeOne(inputPath, index) {
  const name = path.basename(inputPath, path.extname(inputPath));
  const outName = `screenshot-${String(index + 1).padStart(2, '0')}-${W}x${H}.png`;
  const outPath = path.join(OUT_DIR, outName);
  await sharp(inputPath)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .toFile(outPath);
  console.log('Resized:', outName);
}

async function main() {
  const files = process.argv.slice(2).filter((f) => fs.existsSync(f));
  if (files.length === 0) {
    console.error('Usage: node resize-screenshots-for-apple.js <png1> <png2> ...');
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (let i = 0; i < files.length; i++) {
    await resizeOne(files[i], i);
  }
  console.log('Done. Output in', OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
