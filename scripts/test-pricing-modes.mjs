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

// Every pricing number and rule in site.ts is null until Jay sets them. In
// every display mode the ledger must then show the one honest line and no
// amount, rule or insurance claim. (When Jay fills the fields in, extend this
// test with the per-mode number checks.)
for (const mode of ["full", "startingAt", "quoteOnly"]) {
  const out = execSync(`npx tsx --tsconfig tsconfig.json scripts/.tmp/render-pricing.tsx ${mode}`, { encoding: "utf8" });
  const t = out.replace(/<[^>]+>/g, " ").replace(/&#x27;|&apos;/g, "'");
  check(`${mode}: the honest line renders`, /data-unconfirmed/.test(out) && /Jay is confirming these details/.test(t));
  check(`${mode}: no dollar amounts`, !/\$\s?\d/.test(t), (t.match(/\$\s?\d+/g) ?? []).join(","));
  check(`${mode}: no Medicare claim`, !/Medicare/.test(t));
  check(`${mode}: Medicaid answer is the brokers sentence`, /We're currently private-pay and facility-billed/.test(t));
}
process.exit(fails ? 1 : 0);
