// Verifies every text/background pair in the palette against WCAG targets.
const hex = (h) => h.replace("#", "").match(/../g).map((x) => parseInt(x, 16) / 255);
const lum = (h) => { const [r, g, b] = hex(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const P = { navy950: "#0B1B33", navy900: "#10284A", navy700: "#1F4570", navy100: "#E4EBF5", cream: "#FBF7F0", sand: "#F3ECE0", white: "#FFFFFF", ink: "#14202F", muted: "#3E4A5A", amber: "#F4A340", amberHover: "#F7B865", amberInk: "#8A4B00", error: "#A3161A", success: "#1B6B3A", mist: "#C9D6E8", line: "#6B7A8F" };
const pairs = [
  ["Body text on cream", "ink", "cream", 7], ["Body text on white", "ink", "white", 7], ["Body text on sand", "ink", "sand", 7],
  ["Muted text on cream", "muted", "cream", 7], ["Muted text on sand", "muted", "sand", 7], ["Muted on white", "muted", "white", 7],
  ["Heading navy on cream", "navy900", "cream", 7], ["Link navy700 on cream", "navy700", "cream", 7], ["navy700 on white", "navy700", "white", 7],
  ["Cream text on navy900", "cream", "navy900", 7], ["Mist text on navy900", "mist", "navy900", 7], ["Cream on navy950", "cream", "navy950", 7],
  ["CTA: navy950 on amber", "navy950", "amber", 7], ["CTA hover: navy950 on amberHover", "navy950", "amberHover", 7],
  ["Amber ink (small accent text) on cream", "amberInk", "cream", 4.5], ["Error text on cream", "error", "cream", 7], ["Error on white", "error", "white", 7], ["Success on cream", "success", "cream", 4.5],
  ["Focus ring navy900 vs cream (non-text 3:1)", "navy900", "cream", 3], ["Focus ring amber vs navy900 (non-text 3:1)", "amber", "navy900", 3],
  ["Input border line vs white (non-text 3:1)", "line", "white", 3], ["Navy text on navy100", "navy900", "navy100", 7],
];
let fail = 0;
for (const [label, fg, bg, min] of pairs) { const r = ratio(P[fg], P[bg]); const ok = r >= min; if (!ok) fail++; console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}:1  (need ${min})  ${label}`); }
process.exit(fail ? 1 : 0);
