#!/usr/bin/env node
/**
 * Resize screenshots for macOS App Store: 1280×800, entire screenshot visible
 * (fit: 'contain' — no cropping; letterboxing if needed).
 * Usage: node scripts/resize-screenshots-for-macos.js <file1> <file2> ...
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '../screenshots-macos');
const W = 1280;
const H = 800;
const BACKGROUND = '#0A0A0F'; // match app background for letterboxing

async function resizeOne(inputPath, index) {
  const outName = `screenshot-${String(index + 1).padStart(2, '0')}-${W}x${H}.png`;
  const outPath = path.join(OUT_DIR, outName);
  await sharp(inputPath)
    .resize(W, H, { fit: 'contain', position: 'center', background: BACKGROUND })
    .flatten({ background: BACKGROUND })
    .toFile(outPath);
  console.log('Resized:', outName);
}

async function main() {
  const files = process.argv.slice(2).filter((f) => fs.existsSync(f));
  if (files.length === 0) {
    console.error('Usage: node resize-screenshots-for-macos.js <png1> <png2> ...');
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
