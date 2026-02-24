#!/usr/bin/env node
/**
 * Resize screenshots to 396×484px.
 * Reads from screenshots-apple (existing *-2064x2752.png), writes *-396x484.png.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '../screenshots-apple');
const W = 396;
const H = 484;

async function main() {
  const files = fs.readdirSync(DIR)
    .filter((f) => f.endsWith('-2064x2752.png'))
    .sort()
    .map((f) => path.join(DIR, f));
  if (files.length === 0) {
    console.error('No *-2064x2752.png files in screenshots-apple');
    process.exit(1);
  }
  for (let i = 0; i < files.length; i++) {
    const outName = `screenshot-${String(i + 1).padStart(2, '0')}-${W}x${H}.png`;
    const outPath = path.join(DIR, outName);
    await sharp(files[i])
      .resize(W, H, { fit: 'cover', position: 'center' })
      .toFile(outPath);
    console.log('Resized:', outName);
  }
  console.log('Done. Output in', DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
