-- =============================================================================
-- SayPay — 001_init.sql
-- Quote-to-cash & voice-backed approvals.
--
-- Security model
--   * Every table has RLS enabled.
--   * Contractors (Supabase `authenticated` users) can only touch rows that
--     belong to the workspace they own. Sensitive columns (Stripe/billing,
--     decision/audit fields) are not granted to `authenticated` at all.
--   * Clients never get database access. `/q/[token]` is served by Next.js
--     Server Components / Server Actions that look the quote up by its
--     unguessable share_token using the service-role key (server only), then
--     perform narrowly-scoped, validated writes. `anon` has no table grants.
--   * Storage objects live in the private `quote-media` bucket under
--     `{workspace_id}/{quote_id}/{file}`. Owners can read/write their own
--     workspace folder; clients only ever receive short-lived signed URLs.
-- =============================================================================

-- gen_random_uuid() is built into Postgres 13+; no extension required.

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.quote_status as enum ('sent', 'viewed', 'changes_requested', 'approved', 'declined');
create type public.deposit_status as enum ('not_required', 'unpaid', 'paid');
create type public.sender_role as enum ('contractor', 'client');
create type public.attachment_kind as enum ('image', 'video', 'audio');

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- workspaces: one per contractor account (business profile + billing)
-- -----------------------------------------------------------------------------
create table public.workspaces (
  id                        uuid primary key default gen_random_uuid(),
  owner_id                  uuid not null unique references auth.users (id) on delete cascade,

  -- Business profile & branding
  business_name             text not null default 'My Business' check (char_length(business_name) between 1 and 120),
  contact_name              text check (char_length(contact_name) <= 120),
  contact_phone             text check (char_length(contact_phone) <= 40),
  contact_email             text check (char_length(contact_email) <= 254),
  trade                     text check (char_length(trade) <= 80),
  logo_path                 text,
  brand_color               text not null default '#0B1220' check (brand_color ~ '^#[0-9A-Fa-f]{6}$'),

  -- Quote defaults
  currency                  text not null default 'GBP' check (currency ~ '^[A-Z]{3}$'),
  default_deposit_percent   numeric(5,2) not null default 25 check (default_deposit_percent between 0 and 100),
  default_tax_rate          numeric(5,2) not null default 0 check (default_tax_rate between 0 and 100),
  tax_label                 text not null default 'VAT' check (char_length(tax_label) between 1 and 20),
  deposit_link_url          text check (deposit_link_url is null or deposit_link_url ~ '^https://'),

  -- Stripe (SaaS subscription) — written only by the server (service role)
  stripe_customer_id        text unique,
  stripe_subscription_id    text unique,
  subscription_status       text,
  subscription_price_id     text,
  current_period_end        timestamptz,

  -- Stripe Connect (deposits paid straight to the contractor)
  stripe_connect_account_id text unique,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create trigger workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

-- Auto-provision a workspace for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workspaces (owner_id, business_name, contact_email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'business_name', ''), 'My Business'),
    new.email
  )
  on conflict (owner_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ownership check used by RLS + storage policies. SECURITY DEFINER so it can
-- read workspaces without recursive policy evaluation.
create or replace function public.is_workspace_owner(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = ws_id and w.owner_id = (select auth.uid())
  );
$$;

-- Storage helper: first path segment is the workspace id (compared as text so a
-- malformed path simply fails the check instead of raising a cast error).
create or replace function public.owns_storage_folder(folder text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspaces w
    where w.id::text = folder and w.owner_id = (select auth.uid())
  );
$$;

-- -----------------------------------------------------------------------------
-- quotes
-- -----------------------------------------------------------------------------
create table public.quotes (
  id                          uuid primary key default gen_random_uuid(),
  workspace_id                uuid not null references public.workspaces (id) on delete cascade,

  -- 24 random bytes, base64url => 32 chars. Generated server-side with
  -- crypto.randomBytes(24).toString("base64url").
  share_token                 text not null unique check (share_token ~ '^[A-Za-z0-9_-]{32,}$'),

  title                       text not null check (char_length(title) between 1 and 140),
  scope                       text check (char_length(scope) <= 5000),
  client_name                 text not null check (char_length(client_name) between 1 and 120),
  client_email                text check (char_length(client_email) <= 254),
  client_phone                text check (char_length(client_phone) <= 40),

  -- [{ id, description, quantity, unit_price_cents }]
  line_items                  jsonb not null default '[]'::jsonb check (jsonb_typeof(line_items) = 'array'),
  currency                    text not null default 'GBP' check (currency ~ '^[A-Z]{3}$'),
  subtotal_cents              bigint not null default 0 check (subtotal_cents >= 0),
  tax_label                   text not null default 'VAT',
  tax_rate                    numeric(5,2) not null default 0 check (tax_rate between 0 and 100),
  tax_cents                   bigint not null default 0 check (tax_cents >= 0),
  total_cents                 bigint not null default 0 check (total_cents >= 0),
  deposit_type                text not null default 'percent' check (deposit_type in ('percent', 'fixed')),
  deposit_percent             numeric(5,2) check (deposit_percent between 0 and 100),
  deposit_cents               bigint not null default 0 check (deposit_cents >= 0),
  valid_until                 date,

  status                      public.quote_status not null default 'sent',
  viewed_at                   timestamptz,

  -- Decision audit (server-written only)
  decision_note               text check (char_length(decision_note) <= 2000),
  decided_at                  timestamptz,
  decided_by_name             text,
  decision_meta               jsonb,       -- { ip, user_agent }
  approved_snapshot           jsonb,       -- frozen commercial terms at approval

  deposit_status              public.deposit_status not null default 'not_required',
  deposit_paid_at             timestamptz,
  deposit_checkout_session_id text,

  -- Denormalised thread state for the dashboard ("Awaiting reply")
  last_message_role           public.sender_role,
  last_message_at             timestamptz,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  constraint deposit_not_above_total check (deposit_cents <= total_cents)
);

create index quotes_workspace_created_idx on public.quotes (workspace_id, created_at desc);
create index quotes_workspace_status_idx on public.quotes (workspace_id, status);

create trigger quotes_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

create or replace function public.owns_quote(q_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.quotes q
    join public.workspaces w on w.id = q.workspace_id
    where q.id = q_id and w.owner_id = (select auth.uid())
  );
$$;

-- Business rules enforced in the database (defence in depth):
--   * Approved quotes are locked: commercial terms and status cannot change.
--   * Declined quotes cannot change status.
--   * Contractors (authenticated) can never set approved/declined/viewed
--     themselves — only the client flow (service role) can.
create or replace function public.quotes_guard()
returns trigger
language plpgsql
as $$
declare
  caller_role text := coalesce((select auth.jwt() ->> 'role'), 'postgres');
begin
  if tg_op = 'INSERT' then
    if caller_role = 'authenticated' and new.status <> 'sent' then
      raise exception 'New quotes must start as sent' using errcode = 'check_violation';
    end if;
    return new;
  end if;

  if old.status = 'approved' then
    if new.status is distinct from old.status
       or new.line_items is distinct from old.line_items
       or new.subtotal_cents is distinct from old.subtotal_cents
       or new.tax_rate is distinct from old.tax_rate
       or new.tax_cents is distinct from old.tax_cents
       or new.total_cents is distinct from old.total_cents
       or new.deposit_cents is distinct from old.deposit_cents
       or new.title is distinct from old.title
       or new.scope is distinct from old.scope
       or new.currency is distinct from old.currency then
      raise exception 'Quote is approved and locked' using errcode = 'check_violation';
    end if;
  end if;

  if old.status = 'declined' and new.status is distinct from old.status then
    raise exception 'Quote was declined and cannot be reopened' using errcode = 'check_violation';
  end if;

  if caller_role = 'authenticated'
     and new.status is distinct from old.status
     and new.status <> 'sent' then
    raise exception 'Contractors can only re-send a quote' using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger quotes_guard_trg
  before insert or update on public.quotes
  for each row execute function public.quotes_guard();

-- -----------------------------------------------------------------------------
-- quote_attachments: photos, videos, voice notes (from either side)
-- -----------------------------------------------------------------------------
create table public.quote_attachments (
  id                uuid primary key default gen_random_uuid(),
  quote_id          uuid not null references public.quotes (id) on delete cascade,
  uploaded_by       public.sender_role not null,
  kind              public.attachment_kind not null,
  storage_path      text not null unique,
  mime_type         text not null check (char_length(mime_type) <= 100),
  size_bytes        bigint not null check (size_bytes > 0),
  duration_seconds  numeric(7,2) check (duration_seconds >= 0),
  caption           text check (char_length(caption) <= 280),
  is_walkthrough    boolean not null default false,   -- the contractor's headline voice note
  created_at        timestamptz not null default now()
);

create index quote_attachments_quote_idx on public.quote_attachments (quote_id, created_at);
create unique index quote_attachments_one_walkthrough
  on public.quote_attachments (quote_id) where is_walkthrough;

-- -----------------------------------------------------------------------------
-- quote_messages: two-way thread (text and/or voice note)
-- -----------------------------------------------------------------------------
create table public.quote_messages (
  id             uuid primary key default gen_random_uuid(),
  quote_id       uuid not null references public.quotes (id) on delete cascade,
  sender_role    public.sender_role not null,
  sender_name    text not null check (char_length(sender_name) between 1 and 80),
  body           text not null default '' check (char_length(body) <= 4000),
  attachment_id  uuid references public.quote_attachments (id) on delete set null,
  created_at     timestamptz not null default now(),
  constraint message_has_content check (char_length(body) > 0 or attachment_id is not null)
);

create index quote_messages_quote_idx on public.quote_messages (quote_id, created_at);

create or replace function public.touch_quote_last_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.quotes
     set last_message_role = new.sender_role,
         last_message_at   = new.created_at
   where id = new.quote_id;
  return new;
end;
$$;

create trigger quote_messages_touch_quote
  after insert on public.quote_messages
  for each row execute function public.touch_quote_last_message();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.workspaces        enable row level security;
alter table public.quotes            enable row level security;
alter table public.quote_messages    enable row level security;
alter table public.quote_attachments enable row level security;

-- Clients (anon) never talk to the database directly.
revoke all on public.workspaces, public.quotes, public.quote_messages, public.quote_attachments from anon;

-- ---- workspaces -------------------------------------------------------------
revoke insert, update, delete on public.workspaces from authenticated;
grant select on public.workspaces to authenticated;
grant update (
  business_name, contact_name, contact_phone, contact_email, trade, logo_path, brand_color,
  currency, default_deposit_percent, default_tax_rate, tax_label, deposit_link_url
) on public.workspaces to authenticated;

create policy "Owners read their workspace"
  on public.workspaces for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "Owners update their workspace profile"
  on public.workspaces for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- ---- quotes -----------------------------------------------------------------
revoke insert, update, delete on public.quotes from authenticated;
grant select, delete on public.quotes to authenticated;
grant insert (
  id, workspace_id, share_token, title, scope, client_name, client_email, client_phone,
  line_items, currency, subtotal_cents, tax_label, tax_rate, tax_cents, total_cents,
  deposit_type, deposit_percent, deposit_cents, valid_until, status, deposit_status
) on public.quotes to authenticated;
grant update (
  title, scope, client_name, client_email, client_phone,
  line_items, currency, subtotal_cents, tax_label, tax_rate, tax_cents, total_cents,
  deposit_type, deposit_percent, deposit_cents, valid_until, status, deposit_status, deposit_paid_at
) on public.quotes to authenticated;

create policy "Owners read their quotes"
  on public.quotes for select to authenticated
  using (public.is_workspace_owner(workspace_id));

create policy "Owners create quotes in their workspace"
  on public.quotes for insert to authenticated
  with check (public.is_workspace_owner(workspace_id));

create policy "Owners update their quotes"
  on public.quotes for update to authenticated
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

create policy "Owners delete undecided quotes"
  on public.quotes for delete to authenticated
  using (public.is_workspace_owner(workspace_id) and status <> 'approved');

-- ---- quote_messages ---------------------------------------------------------
revoke update on public.quote_messages from authenticated;
grant select, insert, delete on public.quote_messages to authenticated;

create policy "Owners read their quote threads"
  on public.quote_messages for select to authenticated
  using (public.owns_quote(quote_id));

create policy "Owners post as contractor"
  on public.quote_messages for insert to authenticated
  with check (public.owns_quote(quote_id) and sender_role = 'contractor');

create policy "Owners delete their own messages"
  on public.quote_messages for delete to authenticated
  using (public.owns_quote(quote_id) and sender_role = 'contractor');

-- ---- quote_attachments ------------------------------------------------------
revoke update on public.quote_attachments from authenticated;
grant select, insert, delete on public.quote_attachments to authenticated;

create policy "Owners read attachments"
  on public.quote_attachments for select to authenticated
  using (public.owns_quote(quote_id));

create policy "Owners add contractor attachments"
  on public.quote_attachments for insert to authenticated
  with check (public.owns_quote(quote_id) and uploaded_by = 'contractor');

create policy "Owners remove contractor attachments"
  on public.quote_attachments for delete to authenticated
  using (public.owns_quote(quote_id) and uploaded_by = 'contractor');

-- Magic-link (client) actions are server-mediated: the Next.js server uses the
-- service_role key, which bypasses RLS, *after* resolving and validating the
-- share_token and the quote's state. No anon policies exist by design.

-- =============================================================================
-- Storage: private bucket for photos, videos and voice notes
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-media',
  'quote-media',
  false,
  52428800, -- 50 MB (Supabase free-tier global limit; raise on paid plans)
  array['image/*', 'video/*', 'audio/*']
)
on conflict (id) do nothing;

-- Path convention: {workspace_id}/{quote_id|branding}/{uuid}.{ext}
create policy "Owners read workspace media"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'quote-media'
    and public.owns_storage_folder((storage.foldername(name))[1])
  );

create policy "Owners upload workspace media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'quote-media'
    and public.owns_storage_folder((storage.foldername(name))[1])
  );

create policy "Owners delete workspace media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'quote-media'
    and public.owns_storage_folder((storage.foldername(name))[1])
  );
