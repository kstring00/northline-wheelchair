// Sends one real submission through each form route and prints what happened.
// Run it against a deployment that has RESEND_API_KEY / BOOKING_* (a Resend
// test key is fine) and, ideally, the Upstash store:
//
//   npm run test:forms -- https://<your-preview>.vercel.app
//
// Then check BOOKING_TO_EMAIL for three emails with these subjects:
//   Ride request: {name} · {date} · {window} · NL-…
//   Quote request: 77014 → 77030 · {date} · NL-…
//   Facility inquiry: Cypress Creek Rehab · Skilled nursing · 3–5 rides/week · NL-…
// Each response below should be 200 with emailed: true (and stored: true once
// the store is set up). A 503 means the deployment can't deliver yet.
const BASE = (process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const date = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
const ip = `192.0.2.${Math.floor(Math.random() * 250) + 1}`;
const forms = [
  ["book", { contactName: "Test Rider (Northline form test)", phone: "2815550000", pickupAddress: "1200 Test St, Spring, TX", destination: "Test Clinic, Houston", date, timeWindow: "morning" }],
  ["quote", { pickupZip: "77014", destZip: "77030", date, phone: "2815550000" }],
  ["partner", { kind: "account", facility: "Cypress Creek Rehab", facilityType: "Skilled nursing", contactName: "Test Planner", role: "Discharge planner", phone: "2815550000", email: "test@example.org", volume: "3–5" }],
];
let bad = 0;
for (const [route, body] of forms) {
  const res = await fetch(`${BASE}/api/${route}`, { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify(body) });
  const j = await res.json().catch(() => ({}));
  const ok = res.status === 200 && j.ok && j.emailed;
  if (!ok) bad++;
  console.log(`${ok ? "OK  " : "FAIL"}  /api/${route}  HTTP ${res.status}  ref=${j.ref ?? "-"}  emailed=${j.emailed ?? "-"}  stored=${j.stored ?? "-"}${j.errors ? `  errors=${JSON.stringify(j.errors)}` : ""}${j.message ? `  message=${j.message}` : ""}`);
}
process.exit(bad ? 1 : 0);
