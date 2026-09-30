import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site, areaList } from "@/config/site";

// Satori needs TTF/OTF (not woff2). Bricolage Grotesque is SIL OFL licensed.
const bricolageBold = await readFile(join(process.cwd(), "src/assets/fonts/BricolageGrotesque-Bold.ttf"));

export const alt = `${site.name}: wheelchair van rides in Houston, TX`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded 1200×630 share image, built at compile time from site.ts. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#10284A", padding: 72, color: "#FBF7F0", fontFamily: "Bricolage" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 48 48">
            <rect width="48" height="48" rx="12" fill="#0B1B33" />
            <circle cx="12" cy="34" r="4.5" fill="#FBF7F0" />
            <path d="M34 7a7 7 0 0 1 7 7c0 5.2-7 12-7 12s-7-6.8-7-12a7 7 0 0 1 7-7z" fill="#F4A340" />
            <circle cx="34" cy="14" r="2.6" fill="#10284A" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 700 }}>{site.shortName}</div>
            <div style={{ fontSize: 22, letterSpacing: 3, color: "#C9D6E8" }}>WHEELCHAIR TRANSPORTATION</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5, maxWidth: 980 }}>Wheelchair van rides in Houston</div>
          <div style={{ fontSize: 30, marginTop: 20, color: "#C9D6E8", maxWidth: 1000 }}>{`Door-to-door help in ${areaList()}.`}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <svg width="520" height="80" viewBox="0 0 320 80">
            <circle cx="12" cy="58" r="8" fill="#FBF7F0" />
            <path d="M20 58 C 70 58, 80 22, 140 30 S 220 66, 270 40" fill="none" stroke="#C9D6E8" strokeWidth="4" strokeLinecap="round" />
            <path d="M288 6a14 14 0 0 1 14 14c0 10.5-14 24-14 24s-14-13.5-14-24a14 14 0 0 1 14-14z" fill="#F4A340" />
            <circle cx="288" cy="20" r="5" fill="#10284A" />
          </svg>
          <div style={{ display: "flex", background: "#F4A340", color: "#0B1B33", fontSize: 34, fontWeight: 700, padding: "16px 32px", borderRadius: 999 }}>
            {site.phone.display}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Bricolage", data: bricolageBold, weight: 700, style: "normal" }] },
  );
}
