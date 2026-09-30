// Generates duotone placeholder illustrations (navy + amber) for every photo
// slot. Each is a stand-in for a real photo of Jay's vans/team. CONFIRM: replace.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT = "public/images";
mkdirSync(OUT, { recursive: true });
const C = { n950: "#0B1B33", n900: "#10284A", n800: "#173659", n700: "#1F4570", n600: "#2B5886", mist: "#C9D6E8", cream: "#FBF7F0", sand: "#F3ECE0", amber: "#F4A340", amberSoft: "#F7C98C" };

const tag = (w, h, text) => `
  <g transform="translate(${w - 40}, ${h - 40})">
    <rect x="${-(text.length * 13 + 40)}" y="-52" width="${text.length * 13 + 40}" height="52" rx="26" fill="${C.n950}" fill-opacity="0.72"/>
    <text x="-20" y="-18" text-anchor="end" font-family="DejaVu Sans, sans-serif" font-size="22" font-weight="700" fill="${C.cream}" letter-spacing="1">${text}</text>
  </g>`;

const sky = (w, h, id) => `
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.n700}"/><stop offset="1" stop-color="${C.n900}"/>
    </linearGradient>
    <radialGradient id="${id}sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.amberSoft}"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#${id})"/>`;

const skyline = (w, base, scale = 1, fill = C.n800) => {
  const blds = [[0,140,90],[100,220,70],[180,300,110],[300,180,80],[390,380,90],[490,260,70],[570,440,100],[680,320,80],[770,200,120],[900,340,90],[1000,240,70],[1080,160,120],[1210,280,80],[1300,190,110],[1420,120,180]];
  return blds.map(([x, hgt, bw]) => `<rect x="${x * scale * (w / 1600)}" y="${base - hgt * scale}" width="${bw * scale * (w / 1600)}" height="${hgt * scale + 400}" fill="${fill}"/>`).join("");
};

const van = (x, y, s = 1, ramp = true) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <rect x="0" y="0" width="640" height="250" rx="46" fill="${C.cream}"/>
    <rect x="0" y="150" width="640" height="26" fill="${C.n700}"/>
    <rect x="40" y="36" width="130" height="86" rx="14" fill="${C.n600}"/>
    <rect x="190" y="36" width="170" height="86" rx="14" fill="${C.n600}"/>
    <rect x="380" y="36" width="150" height="86" rx="14" fill="${C.n600}"/>
    <path d="M550 36 h40 a40 40 0 0 1 40 40 v46 h-80z" fill="${C.n600}"/>
    <circle cx="130" cy="252" r="52" fill="${C.n950}"/><circle cx="130" cy="252" r="22" fill="${C.mist}"/>
    <circle cx="520" cy="252" r="52" fill="${C.n950}"/><circle cx="520" cy="252" r="22" fill="${C.mist}"/>
    <g transform="translate(250 150)"><path d="M0 -26a18 18 0 0 1 18 18c0 13-18 30-18 30s-18-17-18-30a18 18 0 0 1 18-18z" fill="${C.amber}"/><circle cx="0" cy="-8" r="6" fill="${C.n900}"/></g>
    ${ramp ? `<path d="M190 250 L 360 250 L 420 310 L 150 310 Z" fill="${C.mist}" opacity="0.9"/>` : ""}
  </g>`;

const wheelchairRider = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="40" cy="120" r="62" fill="none" stroke="${C.n950}" stroke-width="14"/>
    <circle cx="40" cy="120" r="10" fill="${C.n950}"/>
    <path d="M-10 60 h90 v-70" stroke="${C.n950}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <circle cx="120" cy="170" r="16" fill="${C.n950}"/>
    <path d="M80 60 L 130 60 L 130 150" stroke="${C.n950}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M10 -120 q30 -10 55 0 l10 110 h-80z" fill="${C.amber}"/>
    <circle cx="38" cy="-160" r="36" fill="${C.amberSoft}"/>
    <path d="M10 -175 q28 -30 58 0" fill="${C.cream}"/>
  </g>`;

const helper = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <rect x="0" y="-60" width="90" height="230" rx="40" fill="${C.n950}"/>
    <rect x="10" y="-40" width="70" height="120" rx="30" fill="${C.cream}" opacity="0.14"/>
    <circle cx="45" cy="-110" r="40" fill="${C.amberSoft}"/>
    <path d="M85 0 q60 20 90 70" stroke="${C.n950}" stroke-width="26" fill="none" stroke-linecap="round"/>
    <rect x="10" y="160" width="30" height="130" rx="14" fill="${C.n950}"/><rect x="50" y="160" width="30" height="130" rx="14" fill="${C.n950}"/>
  </g>`;

const route = (x, y, w, color = C.amber) => `
  <g transform="translate(${x} ${y})" opacity="0.9">
    <circle cx="0" cy="0" r="14" fill="${C.cream}"/>
    <path d="M20 0 C ${w * 0.3} 0, ${w * 0.35} -70, ${w * 0.55} -50 S ${w * 0.85} 10, ${w - 40} -30" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="2 18"/>
    <path d="M${w - 20} -100 a28 28 0 0 1 28 28 c0 21 -28 48 -28 48 s-28 -27 -28 -48 a28 28 0 0 1 28 -28z" fill="${color}"/>
    <circle cx="${w - 20}" cy="-72" r="10" fill="${C.n900}"/>
  </g>`;

const scenes = {
  "hero-placeholder": [1600, 1200, (w, h) => `${sky(w, h, "g")}
    <circle cx="1240" cy="300" r="260" fill="url(#gsun)"/>
    ${skyline(w, 700, 1, C.n800)}
    <rect y="820" width="${w}" height="${h}" fill="${C.n950}"/>
    <rect y="810" width="${w}" height="16" fill="${C.n600}"/>
    ${van(640, 520, 1.25)}
    ${wheelchairRider(420, 640, 1.15)}
    ${helper(250, 560, 1.15)}
    ${route(120, 300, 620)}
    ${tag(w, h, "PHOTO PLACEHOLDER")}`],
  "van-ramp-placeholder": [1600, 1067, (w, h) => `${sky(w, h, "g")}
    <circle cx="300" cy="260" r="200" fill="url(#gsun)"/>
    ${skyline(w, 560, 0.8, C.n800)}
    <rect y="700" width="${w}" height="${h}" fill="${C.n950}"/>
    ${van(420, 400, 1.2)}
    ${tag(w, h, "PHOTO PLACEHOLDER")}`],
  "driver-helping-placeholder": [1600, 1067, (w, h) => `${sky(w, h, "g")}
    <rect x="120" y="120" width="${w - 240}" height="${h - 240}" rx="60" fill="${C.n800}"/>
    <rect x="160" y="160" width="520" height="300" rx="30" fill="${C.n600}"/>
    <rect y="820" width="${w}" height="${h}" fill="${C.n950}"/>
    ${wheelchairRider(760, 560, 1.4)}
    ${helper(430, 520, 1.4)}
    <path d="M760 840 L 640 960 M 1000 840 L 1120 960" stroke="${C.amber}" stroke-width="12" stroke-linecap="round"/>
    ${tag(w, h, "PHOTO PLACEHOLDER")}`],
  "houston-placeholder": [1600, 900, (w, h) => `${sky(w, h, "g")}
    <circle cx="800" cy="620" r="360" fill="url(#gsun)"/>
    ${skyline(w, 700, 1.3, C.n950)}
    ${route(140, 220, 1300)}
    ${tag(w, h, "PHOTO PLACEHOLDER")}`],
  "owner-jay": [960, 1200, (w, h) => `${sky(w, h, "g")}
    <circle cx="700" cy="260" r="220" fill="url(#gsun)"/>
    ${van(380, 560, 0.9, false)}
    <g transform="translate(260 520)">
      <rect x="-120" y="40" width="240" height="700" rx="110" fill="${C.n950}"/>
      <rect x="-80" y="80" width="160" height="260" rx="70" fill="${C.cream}" opacity="0.12"/>
      <circle cx="0" cy="-40" r="100" fill="${C.amberSoft}"/>
      <path d="M-80 -80 q80 -80 160 0" fill="${C.n900}"/>
    </g>
    ${tag(w, h, "JAY'S PHOTO HERE")}`],
};

for (const [name, [w, h, draw]] of Object.entries(scenes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${draw(w, h)}</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(`${OUT}/${name}.jpg`);
  console.log("wrote", `${OUT}/${name}.jpg`);
}
