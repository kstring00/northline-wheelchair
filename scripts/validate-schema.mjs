// Validates every JSON-LD block on every sitemap URL against the official
// schema.org vocabulary (types exist; each property is valid for the type or a
// supertype) plus Google rich-result required fields and @id references.
// Vocabulary: https://raw.githubusercontent.com/schemaorg/schemaorg/main/data/releases/29.3/schemaorg-current-https.jsonld
import { readFileSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const VOCAB = process.env.SCHEMA_VOCAB ?? "/tmp/claude-0/schemaorg.jsonld";
const graph = JSON.parse(readFileSync(VOCAB, "utf8"))["@graph"];
const id = (x) => String(x).replace(/^schema:/, "");
const arr = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);

const classes = new Map();
const props = new Map();
for (const n of graph) {
  const t = arr(n["@type"]);
  if (t.includes("rdfs:Class")) classes.set(id(n["@id"]), arr(n["rdfs:subClassOf"]).map((s) => id(s["@id"])));
  if (t.includes("rdf:Property")) props.set(id(n["@id"]), arr(n["schema:domainIncludes"]).map((d) => id(d["@id"])));
}
const ancestors = (c, seen = new Set()) => { if (seen.has(c)) return seen; seen.add(c); for (const p of classes.get(c) ?? []) ancestors(p, seen); return seen; };

const required = {
  LocalBusiness: ["name", "address", "telephone", "url", "openingHoursSpecification", "geo", "areaServed", "priceRange", "image"],
  Organization: ["name", "url", "logo"],
  Service: ["name", "provider", "areaServed", "serviceType"],
  BreadcrumbList: ["itemListElement"],
  FAQPage: ["mainEntity"],
  Question: ["name", "acceptedAnswer"],
  Answer: ["text"],
  ListItem: ["position", "name", "item"],
  PostalAddress: ["addressLocality", "addressRegion", "postalCode", "addressCountry"],
};

const errors = [];
const summary = [];
function check(node, where) {
  if (typeof node !== "object" || node === null) return;
  if (node["@id"] && Object.keys(node).length === 1) return; // reference
  const type = node["@type"];
  if (!type) { errors.push(`${where}: node without @type ${JSON.stringify(node).slice(0, 80)}`); return; }
  if (!classes.has(type)) errors.push(`${where}: unknown type ${type}`);
  const anc = ancestors(type);
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("@")) continue;
    const domains = props.get(k);
    if (!domains) errors.push(`${where}: ${type}.${k} is not a schema.org property`);
    else if (!domains.some((d) => anc.has(d))) errors.push(`${where}: ${k} is not valid on ${type}`);
    for (const child of arr(v)) if (typeof child === "object") check(child, `${where} > ${type}.${k}`);
  }
  for (const r of required[type] ?? []) if (node[r] == null || (Array.isArray(node[r]) && !node[r].length)) errors.push(`${where}: ${type} missing ${r}`);
  if (type === "ListItem" && !/^https?:\/\//.test(node.item)) errors.push(`${where}: ListItem.item must be absolute`);
}

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
for (const path of urls) {
  const html = await (await fetch(BASE + path)).text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => arr(JSON.parse(m[1])));
  const ids = new Set();
  const refs = [];
  const walk = (n) => { if (typeof n !== "object" || !n) return; for (const x of arr(n)) { if (x["@id"] && Object.keys(x).length > 1) ids.add(x["@id"]); if (x["@id"] && Object.keys(x).length === 1) refs.push(x["@id"]); for (const v of Object.values(x)) if (typeof v === "object") walk(v); } };
  blocks.forEach(walk);
  for (const r of refs) if (!ids.has(r)) errors.push(`${path}: unresolved @id reference ${r}`);
  blocks.forEach((b) => check(b, path));
  summary.push(`${path.padEnd(38)} ${blocks.map((b) => b["@type"]).join(", ")}`);
}
console.log(summary.join("\n"));
console.log(errors.length ? `\n${errors.length} problem(s):\n${errors.join("\n")}` : "\nAll JSON-LD valid against schema.org 29.3 + required fields + @id references.");
process.exit(errors.length ? 1 : 0);
