/**
 * Generate icon.png, adaptive-icon.png, splash.png, and favicon.png from one source
 * image. Replaces any white/light background with solid dark blue #0A0A0F.
 * Run: node scripts/replace-all-icons.js
 */
const sharp = require('sharp');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');
const SOURCE = path.join(ASSETS, 'new-logo.png');
const DARK = { r: 10, g: 10, b: 15 };
const LIGHT_THRESHOLD = 200;

async function ensureNoWhite(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const w = info.width;
  const h = info.height;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const luminance = (r + g + b) / 3;
    if (luminance >= LIGHT_THRESHOLD) {
      data[i] = DARK.r;
      data[i + 1] = DARK.g;
      data[i + 2] = DARK.b;
      if (channels === 4) data[i + 3] = 255;
    }
  }
  return sharp(Buffer.from(data), { raw: { width: w, height: h, channels } })
    .removeAlpha()
    .png()
    .toBuffer();
}

async function main() {
  let img = await sharp(SOURCE).png().toBuffer();
  img = await ensureNoWhite(img);
  const meta = await sharp(img).metadata();
  const w = meta.width || 1024;
  const h = meta.height || 1024;

  // icon.png + adaptive-icon.png: 1024x1024
  const size1024 = 1024;
  const scale = Math.max(size1024 / w, size1024 / h);
  const sw = Math.round(w * scale);
  const sh = Math.round(h * scale);
  const left = Math.max(0, Math.round((sw - size1024) / 2));
  const top = Math.max(0, Math.round((sh - size1024) / 2));
  const icon1024 = await sharp(img)
    .resize(sw, sh)
    .extract({ left, top, width: size1024, height: size1024 })
    .removeAlpha()
    .png({ compressionLevel: 6 })
    .toBuffer();
  await sharp(icon1024).toFile(path.join(ASSETS, 'icon.png'));
  await sharp(icon1024).toFile(path.join(ASSETS, 'adaptive-icon.png'));
  console.log('Written icon.png, adaptive-icon.png (1024x1024)');

  // splash.png: 1284x2688 canvas, logo centered (contain)
  const splashW = 1284;
  const splashH = 2688;
  const splashScale = Math.min(splashW / w, splashH / h);
  const splashLogoW = Math.round(w * splashScale);
  const splashLogoH = Math.round(h * splashScale);
  const splashLeft = Math.round((splashW - splashLogoW) / 2);
  const splashTop = Math.round((splashH - splashLogoH) / 2);
  const darkCanvas = await sharp({
    create: { width: splashW, height: splashH, channels: 3, background: { r: DARK.r, g: DARK.g, b: DARK.b } },
  })
    .png()
    .toBuffer();
  const logoResized = await sharp(img).resize(splashLogoW, splashLogoH).toBuffer();
  await sharp(darkCanvas)
    .composite([{ input: logoResized, left: splashLeft, top: splashTop }])
    .removeAlpha()
    .png({ compressionLevel: 6 })
    .toFile(path.join(ASSETS, 'splash.png'));
  console.log('Written splash.png (1284x2688)');

  // favicon.png: 48x48
  const favicon48 = await sharp(img)
    .resize(48, 48)
    .removeAlpha()
    .png({ compressionLevel: 6 })
    .toBuffer();
  await sharp(favicon48).toFile(path.join(ASSETS, 'favicon.png'));
  console.log('Written favicon.png (48x48)');

  // iOS native asset catalog: all required sizes for TestFlight/App Store (120x120 iPhone, 152x152 iPad, etc.)
  const fs = require('fs');
  const iosRoot = path.join(__dirname, '..', 'ios', 'DribblingMadness', 'Images.xcassets');
  const appIconSetDir = path.join(iosRoot, 'AppIcon.appiconset');
  const splashSet = path.join(iosRoot, 'SplashScreenLogo.imageset');
  const sizes = [
    [20, 'Icon-20@1x.png'],
    [40, 'Icon-20@2x.png'],
    [60, 'Icon-20@3x.png'],
    [29, 'Icon-29@1x.png'],
    [58, 'Icon-29@2x.png'],
    [87, 'Icon-29@3x.png'],
    [40, 'Icon-40@1x.png'],
    [80, 'Icon-40@2x.png'],
    [120, 'Icon-40@3x.png'],
    [120, 'Icon-60@2x.png'],
    [180, 'Icon-60@3x.png'],
    [76, 'Icon-76@1x.png'],
    [152, 'Icon-76@2x.png'],
    [167, 'Icon-83.5@2x.png'],
    [1024, 'App-Icon-1024x1024@1x.png'],
  ];
  const APP_ICON_JSON = {
    images: [
      { size: '20x20', idiom: 'iphone', filename: 'Icon-20@2x.png', scale: '2x' },
      { size: '20x20', idiom: 'iphone', filename: 'Icon-20@3x.png', scale: '3x' },
      { size: '20x20', idiom: 'ipad', filename: 'Icon-20@1x.png', scale: '1x' },
      { size: '20x20', idiom: 'ipad', filename: 'Icon-20@2x.png', scale: '2x' },
      { size: '29x29', idiom: 'iphone', filename: 'Icon-29@2x.png', scale: '2x' },
      { size: '29x29', idiom: 'iphone', filename: 'Icon-29@3x.png', scale: '3x' },
      { size: '29x29', idiom: 'ipad', filename: 'Icon-29@1x.png', scale: '1x' },
      { size: '29x29', idiom: 'ipad', filename: 'Icon-29@2x.png', scale: '2x' },
      { size: '40x40', idiom: 'iphone', filename: 'Icon-40@2x.png', scale: '2x' },
      { size: '40x40', idiom: 'iphone', filename: 'Icon-40@3x.png', scale: '3x' },
      { size: '40x40', idiom: 'ipad', filename: 'Icon-40@1x.png', scale: '1x' },
      { size: '40x40', idiom: 'ipad', filename: 'Icon-40@2x.png', scale: '2x' },
      { size: '60x60', idiom: 'iphone', filename: 'Icon-60@2x.png', scale: '2x' },
      { size: '60x60', idiom: 'iphone', filename: 'Icon-60@3x.png', scale: '3x' },
      { size: '76x76', idiom: 'ipad', filename: 'Icon-76@1x.png', scale: '1x' },
      { size: '76x76', idiom: 'ipad', filename: 'Icon-76@2x.png', scale: '2x' },
      { size: '83.5x83.5', idiom: 'ipad', filename: 'Icon-83.5@2x.png', scale: '2x' },
      { size: '1024x1024', idiom: 'ios-marketing', filename: 'App-Icon-1024x1024@1x.png', scale: '1x' },
    ],
    info: { version: 1, author: 'expo' },
  };
  const iosAppIconDir = path.join(ASSETS, 'ios-app-icon');
  fs.mkdirSync(iosAppIconDir, { recursive: true });
  for (const [size, filename] of sizes) {
    const buf = await sharp(icon1024).resize(size, size).png({ compressionLevel: 6 }).toBuffer();
    await sharp(buf).toFile(path.join(iosAppIconDir, filename));
    if (fs.existsSync(appIconSetDir)) {
      await sharp(buf).toFile(path.join(appIconSetDir, filename));
    }
  }
  fs.writeFileSync(path.join(iosAppIconDir, 'Contents.json'), JSON.stringify(APP_ICON_JSON, null, 2));
  console.log('Written assets/ios-app-icon/ (used by EAS Build plugin)');
  if (fs.existsSync(appIconSetDir)) {
    fs.writeFileSync(path.join(appIconSetDir, 'Contents.json'), JSON.stringify(APP_ICON_JSON, null, 2));
    console.log('Written ios/.../AppIcon.appiconset/');
  }
  if (fs.existsSync(splashSet)) {
    const splashPath = path.join(ASSETS, 'splash.png');
    ['image.png', 'image@2x.png', 'image@3x.png'].forEach((f) => {
      fs.copyFileSync(splashPath, path.join(splashSet, f));
    });
    console.log('Copied splash to ios/.../SplashScreenLogo.imageset/');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
