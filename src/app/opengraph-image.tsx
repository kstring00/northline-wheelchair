import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/config/site";

// Satori needs TTF/OTF (not woff2). Both fonts are SIL OFL licensed.
const bricolage800 = await readFile(join(process.cwd(), "src/assets/fonts/BricolageGrotesque-ExtraBold.ttf"));
const atkinson700 = await readFile(join(process.cwd(), "src/assets/fonts/AtkinsonHyperlegible-Bold.ttf"));

export const alt = `${site.name}: the Northline logomark and wordmark`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#16284A";
const CREAM = "#FAF6EE";
const AMBER = "#E8A33D";

/**
 * 1200×630 share image: logomark left, wordmark right, on cream. The wordmark
 * is built the same way as <Logo>: "Northl" + dotless ı with the pin above + "ne".
 */
export default function OpengraphImage() {
  const fs = 150; // wordmark font size
  const pinW = fs * 0.19;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 64, background: CREAM, color: NAVY }}>
        <svg width="260" height="260" viewBox="0 0 100 100">
          <path d="M22 84 L22 18 L78 84 L78 18" fill="none" stroke={NAVY} strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22" cy="84" r="5.5" fill={CREAM} />
          <path d="M78 2c-7.2 0-13 5.8-13 13 0 9.3 13 21 13 21s13-11.7 13-21c0-7.2-5.8-13-13-13z" fill={AMBER} />
          <circle cx="78" cy="15" r="4.6" fill={CREAM} />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Bricolage", fontWeight: 800, fontSize: fs, lineHeight: 1, letterSpacing: fs * -0.03 }}>
            <span>Northl</span>
            <span style={{ display: "flex", position: "relative" }}>
              {"ı"}
              <svg width={pinW} height={pinW * (31 / 24)} viewBox="0 0 24 31" style={{ position: "absolute", left: "50%", bottom: fs * 0.76, marginLeft: -pinW / 2 }}>
                <path d="M12 0C5.4 0 0 5.4 0 12c0 8.5 12 19 12 19s12-10.5 12-19C24 5.4 18.6 0 12 0z" fill={AMBER} />
                <circle cx="12" cy="12" r="4.5" fill={CREAM} />
              </svg>
            </span>
            <span>ne</span>
          </div>
          <div style={{ display: "flex", fontFamily: "Atkinson", fontWeight: 700, fontSize: fs * 0.17, letterSpacing: fs * 0.17 * 0.11, marginTop: fs * 0.17 * 0.9 }}>
            WHEELCHAIR TRANSPORTATION
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: bricolage800, weight: 800, style: "normal" },
        { name: "Atkinson", data: atkinson700, weight: 700, style: "normal" },
      ],
    },
  );
}
