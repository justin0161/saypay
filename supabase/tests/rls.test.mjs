import { PGlite } from "@electric-sql/pglite";
// Runs 001_init.sql against an in-memory Postgres (PGlite) with minimal Supabase
// auth/storage stand-ins, then exercises RLS, column grants and lock triggers.
// Usage: npm run test:db
import { readFileSync } from "node:fs";

const db = new PGlite();
const migration = readFileSync(process.argv[2], "utf8");

// Minimal Supabase stand-ins: roles, auth schema, storage schema.
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth; create schema storage;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'),1)-1] $$;
  grant usage on schema public, storage, auth to anon, authenticated, service_role;
  grant execute on all functions in schema auth to anon, authenticated, service_role;
  grant all on storage.objects to authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`);
await db.exec(migration);
console.log("✓ migration applied");

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";
await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${A}', 'a@x.co', '{"business_name":"Alpha Plumbing"}'), ('${B}', 'b@x.co', '{}');`);
const ws = (await db.query(`select id, owner_id, business_name from public.workspaces order by business_name`)).rows;
console.log("✓ workspaces auto-created:", ws.map((w) => w.business_name).join(", "));
const wsA = ws.find((w) => w.owner_id === A).id;
const wsB = ws.find((w) => w.owner_id === B).id;

let pass = 0, fail = 0;
async function as(role, sub, fn) {
  await db.exec("begin");
  try {
    await db.exec(`set local role ${role}`);
    await db.query(`select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true)`, [
      sub ?? "",
      JSON.stringify({ role, sub }),
    ]);
    return await fn();
  } finally {
    await db.exec("rollback");
  }
}
async function expectOk(name, role, sub, sql, check) {
  try {
    const r = await as(role, sub, () => db.query(sql));
    if (check && !check(r)) throw new Error("check failed: " + JSON.stringify(r.rows));
    pass++; console.log("  ✓", name);
  } catch (e) { fail++; console.log("  ✗", name, "→", e.message); }
}
async function expectErr(name, role, sub, sql, pattern) {
  try {
    await as(role, sub, () => db.query(sql));
    fail++; console.log("  ✗", name, "→ expected error");
  } catch (e) {
    if (pattern && !pattern.test(e.message)) { fail++; console.log("  ✗", name, "→ wrong error:", e.message); }
    else { pass++; console.log("  ✓", name, `(${e.message.slice(0, 60)})`); }
  }
}

const tok = "a".repeat(32);
const qA = "aaaaaaaa-0000-0000-0000-000000000001";
// Seed a quote for A as postgres (bypasses RLS)
await db.exec(`insert into public.quotes (id, workspace_id, share_token, title, client_name, subtotal_cents, total_cents, deposit_cents, deposit_status)
  values ('${qA}', '${wsA}', '${tok}', 'Radiator', 'Priya', 10000, 12000, 3000, 'unpaid');`);

console.log("\nRLS — workspaces");
await expectOk("owner reads own workspace", "authenticated", A, `select * from public.workspaces`, (r) => r.rows.length === 1 && r.rows[0].id === wsA);
await expectOk("other user cannot see it", "authenticated", B, `select * from public.workspaces where id='${wsA}'`, (r) => r.rows.length === 0);
await expectOk("owner updates profile", "authenticated", A, `update public.workspaces set business_name='Alpha 2' where id='${wsA}' returning id`, (r) => r.rows.length === 1);
await expectErr("owner cannot set stripe fields", "authenticated", A, `update public.workspaces set subscription_status='active' where id='${wsA}'`, /permission denied/);
await expectOk("anon sees nothing", "anon", null, `select 1`, () => true);
await expectErr("anon cannot read quotes", "anon", null, `select * from public.quotes`, /permission denied/);

console.log("\nRLS — quotes");
await expectOk("owner reads own quote", "authenticated", A, `select * from public.quotes`, (r) => r.rows.length === 1);
await expectOk("other user reads none", "authenticated", B, `select * from public.quotes`, (r) => r.rows.length === 0);
await expectErr("B cannot insert into A's workspace", "authenticated", B,
  `insert into public.quotes (workspace_id, share_token, title, client_name) values ('${wsA}', '${"b".repeat(32)}', 'x', 'y')`, /row-level security/);
await expectOk("A inserts in own workspace", "authenticated", A,
  `insert into public.quotes (workspace_id, share_token, title, client_name) values ('${wsA}', '${"c".repeat(32)}', 'x', 'y') returning id`, (r) => r.rows.length === 1);
await expectErr("short share_token rejected", "authenticated", A,
  `insert into public.quotes (workspace_id, share_token, title, client_name) values ('${wsA}', 'short', 'x', 'y')`, /check/);
await expectErr("contractor cannot self-approve", "authenticated", A, `update public.quotes set status='approved' where id='${qA}'`, /only re-send/);
await expectErr("contractor cannot write decided_at", "authenticated", A, `update public.quotes set decided_at=now() where id='${qA}'`, /permission denied/);
await expectOk("contractor can mark deposit paid", "authenticated", A, `update public.quotes set deposit_status='paid' where id='${qA}' returning id`, (r) => r.rows.length === 1);
await expectErr("deposit above total rejected", "authenticated", A, `update public.quotes set deposit_cents=99999 where id='${qA}'`, /deposit_not_above_total/);

console.log("\nServer-mediated client approval (service_role) + lock");
await expectOk("service role approves", "service_role", null, `update public.quotes set status='approved', decided_at=now(), decided_by_name='Priya' where id='${qA}' returning status`, (r) => r.rows[0].status === "approved");
await db.exec(`update public.quotes set status='approved', decided_at=now() where id='${qA}'`);
await expectErr("approved quote: price locked (contractor)", "authenticated", A, `update public.quotes set total_cents=1 where id='${qA}'`, /locked/);
await expectErr("approved quote: price locked (service role)", "service_role", null, `update public.quotes set line_items='[{"x":1}]' where id='${qA}'`, /locked/);
await expectErr("approved quote: status locked", "service_role", null, `update public.quotes set status='declined' where id='${qA}'`, /locked/);
await expectOk("approved quote: deposit can still be settled", "service_role", null, `update public.quotes set deposit_status='paid', deposit_paid_at=now() where id='${qA}' returning id`, (r) => r.rows.length === 1);
await expectOk("owner cannot delete approved quote (0 rows)", "authenticated", A, `delete from public.quotes where id='${qA}' returning id`, (r) => r.rows.length === 0);

console.log("\nRLS — messages & attachments");
await expectOk("owner posts as contractor (+ trigger touches quote)", "authenticated", A,
  `with m as (insert into public.quote_messages (quote_id, sender_role, sender_name, body) values ('${qA}', 'contractor', 'Dan', 'hi') returning quote_id)
   select 1`, () => true);
await db.exec(`insert into public.quote_messages (quote_id, sender_role, sender_name, body) values ('${qA}', 'client', 'Priya', 'Tuesday?')`);
const lm = (await db.query(`select last_message_role from public.quotes where id='${qA}'`)).rows[0];
lm.last_message_role === "client" ? (pass++, console.log("  ✓ last_message_role trigger works on locked quote")) : (fail++, console.log("  ✗ trigger", lm));
await expectErr("owner cannot impersonate client", "authenticated", A,
  `insert into public.quote_messages (quote_id, sender_role, sender_name, body) values ('${qA}', 'client', 'Fake', 'ok')`, /row-level security/);
await expectErr("B cannot post on A's quote", "authenticated", B,
  `insert into public.quote_messages (quote_id, sender_role, sender_name, body) values ('${qA}', 'contractor', 'B', 'x')`, /row-level security/);
await expectErr("empty message rejected", "service_role", null,
  `insert into public.quote_messages (quote_id, sender_role, sender_name, body) values ('${qA}', 'client', 'P', '')`, /message_has_content/);
await expectOk("B sees no messages of A", "authenticated", B, `select * from public.quote_messages`, (r) => r.rows.length === 0);
await expectOk("owner adds contractor attachment", "authenticated", A,
  `insert into public.quote_attachments (quote_id, uploaded_by, kind, storage_path, mime_type, size_bytes, is_walkthrough) values ('${qA}', 'contractor', 'audio', '${wsA}/${qA}/c.webm', 'audio/webm', 10, true) returning id`, (r) => r.rows.length === 1);
await expectErr("owner cannot add client attachment", "authenticated", A,
  `insert into public.quote_attachments (quote_id, uploaded_by, kind, storage_path, mime_type, size_bytes) values ('${qA}', 'client', 'image', 'p', 'image/png', 10)`, /row-level security/);

console.log("\nStorage policies");
await expectOk("owner uploads into own workspace folder", "authenticated", A,
  `insert into storage.objects (bucket_id, name) values ('quote-media', '${wsA}/${qA}/x.jpg') returning id`, (r) => r.rows.length === 1);
await expectErr("owner cannot upload into other workspace", "authenticated", A,
  `insert into storage.objects (bucket_id, name) values ('quote-media', '${wsB}/q/x.jpg')`, /row-level security/);
await expectErr("malformed path rejected (no cast error)", "authenticated", A,
  `insert into storage.objects (bucket_id, name) values ('quote-media', 'not-a-uuid/x.jpg')`, /row-level security/);
const bucket = (await db.query(`select * from storage.buckets`)).rows[0];
bucket && bucket.public === false ? (pass++, console.log("  ✓ private bucket created")) : (fail++, console.log("  ✗ bucket"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
