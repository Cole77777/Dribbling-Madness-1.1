#!/usr/bin/env node
/**
 * Resize screenshots to iPhone 6.5" App Store portrait: 1242 × 2688 px.
 * Uses fit: 'contain' so the FULL screenshot is visible (letterboxed if needed).
 * Usage: node scripts/resize-to-iphone-6.5.js [input-dir]
 *    or: node scripts/resize-to-iphone-6.5.js file1.png file2.png ...
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const W = 1242;
const H = 2688;
const BACKGROUND = '#0A0A0F'; // app background for letterboxing
const OUT_DIR = path.join(__dirname, '../screenshots-1242x2688');

async function main() {
  const args = process.argv.slice(2);
  let fileList = [];

  if (args.length > 0 && args.every((a) => fs.existsSync(a) && fs.statSync(a).isFile())) {
    fileList = args.filter((f) => /\.(png|jpg|jpeg)$/i.test(f));
  }
  if (fileList.length === 0) {
    const INPUT_DIR = args[0] || path.join(__dirname, '../screenshots-apple');
    if (!fs.existsSync(INPUT_DIR)) {
      console.error('Input folder not found:', INPUT_DIR);
      process.exit(1);
    }
    const names = fs.readdirSync(INPUT_DIR).filter((f) => /\.(png|jpg|jpeg)$/i.test(f)).sort();
    fileList = names.map((n) => path.join(INPUT_DIR, n));
  }

  if (fileList.length === 0) {
    console.error('No PNG/JPEG files to process.');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (let i = 0; i < fileList.length; i++) {
    const outName = `screenshot-${String(i + 1).padStart(2, '0')}-${W}x${H}.png`;
    const outPath = path.join(OUT_DIR, outName);
    await sharp(fileList[i])
      .resize(W, H, { fit: 'contain', position: 'center', background: BACKGROUND })
      .flatten({ background: BACKGROUND })
      .toFile(outPath);
    console.log('Resized:', path.basename(fileList[i]), '->', outName);
  }
  console.log('Done. Output in', OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
