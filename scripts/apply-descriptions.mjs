// Fill the draft cake descriptions (src/content/cake-descriptions.ts) into the database.
// Run:  npm run db:descriptions        (reads .env.local)
// Only products whose description is still the "[PLACEHOLDER…" text are updated,
// so anything written in Admin → Products is never overwritten.
import { cakeDescriptions } from "../src/content/cake-descriptions.ts";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (run via: npm run db:descriptions)");
  process.exit(1);
}
const headers = { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" };

const res = await fetch(`${url}/rest/v1/products?select=id,slug,description`, { headers });
if (!res.ok) throw new Error(`products: HTTP ${res.status} ${await res.text()}`);
const products = await res.json();

let updated = 0;
for (const p of products) {
  const text = cakeDescriptions[p.slug];
  if (!text) continue;
  if (p.description && !p.description.startsWith("[PLACEHOLDER")) {
    console.log(`kept    ${p.slug} (already written in admin)`);
    continue;
  }
  const u = await fetch(`${url}/rest/v1/products?id=eq.${p.id}`, { method: "PATCH", headers, body: JSON.stringify({ description: text }) });
  if (!u.ok) throw new Error(`${p.slug}: HTTP ${u.status} ${await u.text()}`);
  console.log(`filled  ${p.slug}`);
  updated++;
}
console.log(`${updated} description(s) filled. Restart the site (or save any product in admin) to refresh the cached catalogue.`);
