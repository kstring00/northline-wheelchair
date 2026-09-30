// Builds favicon.ico, icon.svg, apple-icon.png, manifest icons and logo.png from the brand mark.
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const mark = (pad = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${48 + pad * 2} ${48 + pad * 2}">
  <rect x="${-pad}" y="${-pad}" width="${48 + pad * 2}" height="${48 + pad * 2}" rx="${pad ? 0 : 12}" fill="#10284A"/>
  <circle cx="12" cy="34" r="4.5" fill="#FBF7F0"/>
  <path d="M12 34 C 20 34, 20 22, 28 22 S 34 18, 34 16" fill="none" stroke="#FBF7F0" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 5.5"/>
  <path d="M34 7a7 7 0 0 1 7 7c0 5.2-7 12-7 12s-7-6.8-7-12a7 7 0 0 1 7-7z" fill="#F4A340"/>
  <circle cx="34" cy="14" r="2.6" fill="#10284A"/>
</svg>`;

writeFileSync("src/app/icon.svg", mark());
const png = (svg, size) => sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toBuffer();

writeFileSync("src/app/apple-icon.png", await png(mark(6), 180));
writeFileSync("public/icon-192.png", await png(mark(), 192));
writeFileSync("public/icon-512.png", await png(mark(), 512));
writeFileSync("public/icon-maskable-512.png", await png(mark(10), 512));
writeFileSync("public/logo.png", await png(mark(), 512));

// favicon.ico containing 16/32/48 PNG images.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(mark(), s)));
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
