/**
 * One-time script to generate minimal WAV files for tap and achievement sounds.
 * Run: node scripts/generate-wav.js
 */
const fs = require('fs');
const path = require('path');

function makeWav(samples) {
  const dataSize = samples.length * 2;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(8000, 24);
  header.writeUInt32LE(16000, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  const data = Buffer.alloc(dataSize);
  samples.forEach((s, i) => data.writeInt16LE(s, i * 2));
  return Buffer.concat([header, data]);
}

// Tap: short click (one peak, quick decay)
const tapSamples = [];
for (let i = 0; i < 200; i++) {
  tapSamples.push(i === 0 ? 12000 : Math.round(12000 * Math.exp(-i / 20)));
}
const tapWav = makeWav(tapSamples);

// Achievement: two-tone chime (soft beep up, beep)
const achievementSamples = [];
const freq1 = 523;
const freq2 = 659;
const sr = 8000;
for (let i = 0; i < 400; i++) {
  const t = i / sr;
  let s = 0;
  if (i < 120) s = Math.sin(2 * Math.PI * freq1 * t) * 4000 * (1 - i / 120);
  else if (i < 400) s = Math.sin(2 * Math.PI * freq2 * (t - 0.015)) * 3500 * Math.exp(-(i - 120) / 150);
  achievementSamples.push(Math.round(s));
}
const achievementWav = makeWav(achievementSamples);

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'tap.wav'), tapWav);
fs.writeFileSync(path.join(outDir, 'achievement.wav'), achievementWav);
console.log('Created assets/sounds/tap.wav and achievement.wav');
console.log('tap:', tapWav.length, 'bytes, achievement:', achievementWav.length, 'bytes');
