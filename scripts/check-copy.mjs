// Stage 1 of the claims check (runs in prebuild and CI).
//
// 1. Draft copy about Jay's life ("my dad", "my own dad") fails the build
//    anywhere in the codebase.
// 2. Claim patterns (years, rides completed, on-time, $N, Net-30, insured,
//    certified, background-check) may not appear as literal copy in src/.
//    They may only come from a site.ts field: a line that renders one must
//    carry a `// claims: <site.ts field>` marker, and stage 2
//    (scripts/check-claims.ts, postbuild) fails if that field is null while
//    the claim renders. site.ts itself is exempt here; stage 2 covers it.
// Comments are ignored (ASK JAY notes may name the claim they replace).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const exists = (d) => { try { return statSync(join(ROOT, d)).isDirectory(); } catch { return false; } };

let failed = false;

// 1. Owner copy, everywhere.
const OWNER_BANNED = ["my own dad", "my dad"];
const SELF = new Set(["scripts/check-copy.mjs", "scripts/check-claims.ts"]);
const everywhere = ["src", "scripts", "content", "public"].filter(exists).flatMap((d) => walk(join(ROOT, d)))
  .filter((f) => /\.(tsx?|mjs|js|json|md|mdx|css|svg|txt|html)$/.test(f) && !SELF.has(relative(ROOT, f)));
const ownerHits = [];
for (const f of everywhere) {
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    for (const b of OWNER_BANNED) if (line.toLowerCase().includes(b)) ownerHits.push(`${relative(ROOT, f)}:${i + 1}  "${b}"`);
  });
}
if (ownerHits.length) {
  failed = true;
  console.error("check:copy FAILED. Draft owner copy found:\n  " + ownerHits.join("\n  "));
}

// 2. Literal claims in src/ (not site.ts).
export const CLAIMS = [
  ["years", /\b\d+\+?\s+years\b/i],
  ["rides completed", /rides completed/i],
  ["on-time", /\bon-time\b/i],
  ["$ amount", /\$\s?\d/],
  ["Net-30", /\bnet-30\b/i],
  ["insured", /\binsured\b/i],
  ["certified", /\bcertified\b/i],
  ["background-check", /\bbackground[- ]check/i],
];
const stripComments = (src) =>
  src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[\s;,({])\/\/[^\n]*/g, (m, pre) => pre + " ".repeat(m.length - pre.length));
const sources = walk(join(ROOT, "src")).filter((f) => /\.(tsx?|mdx)$/.test(f) && relative(ROOT, f) !== "src/config/site.ts");
const claimHits = [];
for (const f of sources) {
  const raw = readFileSync(f, "utf8").split("\n");
  const code = stripComments(readFileSync(f, "utf8")).split("\n");
  code.forEach((line, i) => {
    if (/\/\/\s*claims:\s*[\w.]+/.test(raw[i])) return; // sourced from site.ts; stage 2 verifies
    for (const [name, re] of CLAIMS) if (re.test(line)) claimHits.push(`${relative(ROOT, f)}:${i + 1}  ${name}: ${line.trim().slice(0, 100)}`);
  });
}
if (claimHits.length) {
  failed = true;
  console.error("check:copy FAILED. Claims written as literal copy (move them to a site.ts field, or mark the line `// claims: <field>`):\n  " + claimHits.join("\n  "));
}

if (failed) process.exit(1);
console.log(`check:copy passed (${everywhere.length} files for owner copy, ${sources.length} src files for literal claims)`);
