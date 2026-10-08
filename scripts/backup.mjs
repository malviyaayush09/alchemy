// Export every table to backups/<timestamp>/<table>.json using the service-role key.
// Run:  npm run db:backup        (reads .env.local)
// Output contains CUSTOMER DATA: keep it private. backups/ is gitignored.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (run via: npm run db:backup)");
  process.exit(1);
}

const TABLES = [
  "users", "addresses", "products", "product_variants", "tags", "product_tags", "product_images",
  "serviceable_pincodes", "notify_requests", "delivery_slots", "closed_dates", "store_settings", "coupons",
  "orders", "order_items", "order_status_events", "payment_events", "notification_log", "invoice_counters",
  "celebration_reminders",
];
// Not backed up on purpose: sessions, otp_codes, rate_limits (short-lived security data).

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const dir = join(process.cwd(), "backups", stamp);
mkdirSync(dir, { recursive: true });

const PAGE = 1000;
let total = 0;
for (const table of TABLES) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*`, {
      headers: { apikey: key, authorization: `Bearer ${key}`, range: `${from}-${from + PAGE - 1}`, "range-unit": "items" },
    });
    if (res.status === 404) break; // table not created yet (e.g. migration not run)
    if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
    const batch = await res.json();
    rows.push(...batch);
    if (batch.length < PAGE) break;
  }
  writeFileSync(join(dir, `${table}.json`), JSON.stringify(rows, null, 2));
  total += rows.length;
  console.log(`${table.padEnd(22)} ${rows.length}`);
}
writeFileSync(join(dir, "_info.json"), JSON.stringify({ createdAt: new Date().toISOString(), source: url, tables: TABLES, rows: total }, null, 2));
console.log(`\nBacked up ${total} rows to ${dir}`);
console.log("Note: product photos live in Supabase Storage and are not included; download the 'product-images' bucket separately if needed.");
