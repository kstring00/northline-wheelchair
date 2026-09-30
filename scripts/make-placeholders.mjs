// Generates plain photo placeholders for every photo slot: a flat Sand ground
// with the slot's name in Ink. No illustration: the brand uses real photos of
// Jay, his van and his riders or nothing (Brand Guidelines 2.5). CONFIRM: replace.
import sharp from "sharp";
import { mkdirSync, rmSync } from "node:fs";

const OUT = "public/images";
mkdirSync(OUT, { recursive: true });
const SAND = "#EFE6D6";
const INK = "#1E2533";

const slot = (w, h, label) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${SAND}"/>
  <rect x="24" y="24" width="${w - 48}" height="${h - 48}" fill="none" stroke="${INK}" stroke-opacity="0.25" stroke-width="3" stroke-dasharray="14 12"/>
  <text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="DejaVu Sans, sans-serif" font-size="${Math.round(w / 30)}" font-weight="700" fill="${INK}">${label}</text>
</svg>`;

const files = [
  ["hero-placeholder.jpg", 1600, 1200, "[Photo: Jay helping a rider up the van ramp]"],
  ["van-ramp-placeholder.jpg", 1600, 1067, "[Photo: the van with its ramp down]"],
  ["driver-helping-placeholder.jpg", 1600, 1067, "[Photo: securing a wheelchair in the van]"],
  ["owner-jay.jpg", 960, 1200, "[Jay's photo]"],
];

for (const [name, w, h, label] of files) {
  await sharp(Buffer.from(slot(w, h, label))).jpeg({ quality: 70, mozjpeg: true }).toFile(`${OUT}/${name}`);
}
rmSync(`${OUT}/houston-placeholder.jpg`, { force: true });
console.log("placeholders written");
