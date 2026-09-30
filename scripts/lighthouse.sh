#!/usr/bin/env bash
# Lighthouse mobile (default Moto G Power emulation + simulated slow 4G/4x CPU).
export CHROME_PATH=${CHROME_PATH:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}
BASE=${BASE_URL:-http://localhost:3000}
for p in / /book /pricing /services/wheelchair-transportation; do
  name=$( [ "$p" = "/" ] && echo home || echo "$p" | sed 's#^/##; s#/#_#g')
  for run in 1 2 3; do
    npx lighthouse "$BASE$p" --quiet --output=json --output-path="reports/lighthouse/$name-$run.json" \
      --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo >/dev/null 2>&1
  done
done
node -e '
const fs=require("fs");const rows=[];
for (const n of ["home","book","pricing","services_wheelchair-transportation"]) {
  const runs=[1,2,3].map(i=>JSON.parse(fs.readFileSync(`reports/lighthouse/${n}-${i}.json`)));
  const med=(f)=>{const v=runs.map(f).sort((a,b)=>a-b);return v[1];};
  const c=(k)=>med(r=>Math.round(r.categories[k].score*100));
  const a=(k)=>med(r=>r.audits[k].numericValue);
  rows.push({page:n,perf:c("performance"),a11y:c("accessibility"),bp:c("best-practices"),seo:c("seo"),LCP_s:(a("largest-contentful-paint")/1000).toFixed(2),CLS:a("cumulative-layout-shift").toFixed(3),TBT_ms:Math.round(a("total-blocking-time")),FCP_s:(a("first-contentful-paint")/1000).toFixed(2)});
  const r=runs[1];
  const failing=Object.values(r.audits).filter(x=>x.score!==null&&x.score<0.9&&x.scoreDisplayMode!=="informative"&&x.scoreDisplayMode!=="notApplicable"&&x.scoreDisplayMode!=="manual").map(x=>x.id+":"+x.score);
  console.log(n,"under-0.9 audits:",failing.join(", ")||"none");
}
console.table(rows);'
