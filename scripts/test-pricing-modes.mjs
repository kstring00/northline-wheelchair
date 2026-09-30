// Renders the pricing rules in all three displayModes (server-side, no
// browser) and checks: rules visible in every mode; numbers only where the
// mode allows; "startingAt" shows the base fare only.
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("scripts/.tmp", { recursive: true });
// Written inside the project so the "@/..." path alias resolves via tsconfig.
writeFileSync("scripts/.tmp/render-pricing.tsx", `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PricingRules } from "@/components/pricing/PricingRules";
process.stdout.write(renderToStaticMarkup(React.createElement(PricingRules, { mode: process.argv[2] as never })));
`);

let fails = 0;
const check = (n, ok, d = "") => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? `  (${d})` : ""}`); };
const rules = ["Base fare", "Distance", "Wait time", "Companions", "Round trips", "Nights, weekends, holidays", "Cancelling", "How to pay", "Medicaid"];

for (const mode of ["full", "startingAt", "quoteOnly"]) {
  const out = execSync(`npx tsx --tsconfig tsconfig.json scripts/.tmp/render-pricing.tsx ${mode}`, { encoding: "utf8" });
  const t = out.replace(/<[^>]+>/g, " ");
  check(`${mode}: every rule visible`, rules.every((r) => t.includes(r)), rules.filter((r) => !t.includes(r)).join(","));
  const dollars = (t.match(/\$\d+/g) ?? []).length;
  if (mode === "full") check("full: base, per-mile, wait, after-hours amounts shown", dollars >= 4 && /\/ mile/.test(t) && /\/ hour/.test(t), `${dollars} amounts`);
  if (mode === "startingAt") check("startingAt: only 'from $' base fare shown", /from \$\d+/.test(t) && !/\/ mile/.test(t) && !/\/ hour/.test(t), `${dollars} amounts`);
  if (mode === "quoteOnly") check("quoteOnly: no dollar amounts in the ledger", dollars === 0, `${dollars} amounts`);
}
process.exit(fails ? 1 : 0);
