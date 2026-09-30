// Fails the build if draft copy about Jay's life is anywhere in the codebase.
// Nothing on the site describes Jay's life until he writes it (questionnaire Q11).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const BANNED = ["my own dad", "my dad"];
const SELF = "scripts/check-copy.mjs";
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = ["src", "scripts", "content", "public"].filter((d) => { try { return statSync(join(ROOT, d)).isDirectory(); } catch { return false; } })
  .flatMap((d) => walk(join(ROOT, d)))
  .filter((f) => /\.(tsx?|mjs|js|json|md|mdx|css|svg|txt|html)$/.test(f) && relative(ROOT, f) !== SELF);

const hits = [];
for (const f of files) {
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    for (const b of BANNED) if (line.toLowerCase().includes(b)) hits.push(`${relative(ROOT, f)}:${i + 1}  "${b}"`);
  });
}
if (hits.length) {
  console.error("check:copy FAILED. Draft owner copy found:\n  " + hits.join("\n  "));
  process.exit(1);
}
console.log(`check:copy passed (${files.length} files, none of: ${BANNED.map((b) => `"${b}"`).join(", ")})`);
