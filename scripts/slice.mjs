import sharp from "sharp";
const [file, h = "1800"] = process.argv.slice(2);
const img = sharp(file); const { width, height } = await img.metadata();
const step = Number(h); let i = 0;
for (let y = 0; y < height; y += step) {
  await sharp(file).extract({ left: 0, top: y, width, height: Math.min(step, height - y) }).resize({ width: Math.min(width, 900) }).toFile(file.replace(".png", `-part${i++}.png`));
}
console.log(i, "parts", width, height);
