#!/usr/bin/env node
/**
 * Resize screenshots to multiple App Store dimensions.
 * Usage: node scripts/resize-screenshots-multi.js <file1> <file2> ...
 * Output: screenshots-apple/screenshot-NN-WxH.png for each size.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '../screenshots-apple');
const DIMS = [
  [2064, 2752],
  [2752, 2064],
  [2048, 2732],
  [2732, 2048],
];

async function resizeOne(inputPath, index, w, h) {
  const outName = `screenshot-${String(index + 1).padStart(2, '0')}-${w}x${h}.png`;
  const outPath = path.join(OUT_DIR, outName);
  await sharp(inputPath)
    .resize(w, h, { fit: 'cover', position: 'center' })
    .toFile(outPath);
  console.log('  ', outName);
}

async function main() {
  const files = process.argv.slice(2).filter((f) => fs.existsSync(f));
  if (files.length === 0) {
    console.error('Usage: node resize-screenshots-multi.js <png1> <png2> ...');
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (let i = 0; i < files.length; i++) {
    console.log(`Screenshot ${i + 1}/${files.length}:`);
    for (const [w, h] of DIMS) {
      await resizeOne(files[i], i, w, h);
    }
  }
  console.log('Done. Output in', OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
