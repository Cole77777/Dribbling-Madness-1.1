/**
 * Rebuild app icon so the ENTIRE background is one solid dark blue (#0A0A0F).
 * Method: make white/light pixels transparent, composite logo onto a solid dark
 * 1024x1024 canvas so the background is 100% that color (no white possible).
 * Run: node scripts/fix-icon.js
 */
const sharp = require('sharp');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');
const ICON_SRC = path.join(ASSETS, 'icon.png');
const ICON_OUT = path.join(ASSETS, 'icon.png');
const SIZE = 1024;
const DARK = { r: 10, g: 10, b: 15 }; // #0A0A0F
// Any pixel this light or lighter is treated as background → transparent (will show dark)
const LIGHT_THRESHOLD = 200; // luminance (0–255); lower = more aggressive (catches off‑white)

async function main() {
  const { data, info } = await sharp(ICON_SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const w = info.width;
  const h = info.height;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = (r + g + b) / 3;
    if (luminance >= LIGHT_THRESHOLD) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0; // fully transparent → dark will show through
    } else {
      data[i + 3] = 255; // keep logo opaque
    }
  }

  const logoWithTransparentBg = await sharp(Buffer.from(data), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png()
    .toBuffer();

  const scale = Math.max(SIZE / w, SIZE / h);
  const scaledW = Math.round(w * scale);
  const scaledH = Math.round(h * scale);
  const left = Math.max(0, Math.round((scaledW - SIZE) / 2));
  const top = Math.max(0, Math.round((scaledH - SIZE) / 2));

  const logoResized = await sharp(logoWithTransparentBg)
    .resize(scaledW, scaledH)
    .extract({ left, top, width: SIZE, height: SIZE })
    .toBuffer();

  const darkCanvas = await sharp({
    create: { width: SIZE, height: SIZE, channels: 3, background: { r: DARK.r, g: DARK.g, b: DARK.b } },
  })
    .png()
    .toBuffer();

  await sharp(darkCanvas)
    .composite([{ input: logoResized, left: 0, top: 0 }])
    .removeAlpha()
    .png({ compressionLevel: 6 })
    .toFile(ICON_OUT);

  console.log('Written', ICON_OUT, SIZE + 'x' + SIZE);
  console.log('Background is solid', '#0A0A0F', '- no white. Rebuild app to see on device.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
