// Builds favicon.ico, icon.svg, apple-icon.png, manifest icons and logo.png
// from the logomark (Brand Guidelines 1.2): navy N on cream, amber pin, the
// start ring and pin centre in the ground colour.
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const NAVY = "#16284A";
const CREAM = "#FAF6EE";
const AMBER = "#E8A33D";

/** `pad` is the fraction of the canvas left around the mark on each side. */
const mark = (pad = 0.1, rounded = true) => {
  const size = 100 / (1 - pad * 2);
  const o = (size - 100) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-o} ${-o} ${size} ${size}">
  <rect x="${-o}" y="${-o}" width="${size}" height="${size}" rx="${rounded ? size * 0.22 : 0}" fill="${CREAM}"/>
  <path d="M22 84 L22 18 L78 84 L78 18" fill="none" stroke="${NAVY}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="22" cy="84" r="5.5" fill="${CREAM}"/>
  <path d="M78 2c-7.2 0-13 5.8-13 13 0 9.3 13 21 13 21s13-11.7 13-21c0-7.2-5.8-13-13-13z" fill="${AMBER}"/>
  <circle cx="78" cy="15" r="4.6" fill="${CREAM}"/>
</svg>`;
};

writeFileSync("src/app/icon.svg", mark(0.08));
const png = (svg, size) => sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toBuffer();

writeFileSync("src/app/apple-icon.png", await png(mark(0.14, false), 180)); // iOS rounds the corners itself
writeFileSync("public/icon-192.png", await png(mark(0.08), 192));
writeFileSync("public/icon-512.png", await png(mark(0.08), 512));
writeFileSync("public/icon-maskable-512.png", await png(mark(0.2, false), 512)); // mark inside the 80% safe zone
writeFileSync("public/logo.png", await png(mark(0.12, false), 512));

// favicon.ico containing 16/32/48 PNG images.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(mark(0.04), s)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const dirs = images.map((img, i) => {
  const d = Buffer.alloc(16);
  d.writeUInt8(sizes[i], 0); d.writeUInt8(sizes[i], 1); d.writeUInt8(0, 2); d.writeUInt8(0, 3);
  d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6); d.writeUInt32LE(img.length, 8); d.writeUInt32LE(offset, 12);
  offset += img.length;
  return d;
});
writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...dirs, ...images]));
console.log("icons written");
