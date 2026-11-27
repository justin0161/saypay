-- =============================================================================
-- SayPay — 002_bank_transfer.sql
-- Lets contractors take payment by bank transfer as well as card.
--
--   * Contractors store the account clients should pay into. These details are
--     only ever shown to a client on an accepted quote (server-rendered via the
--     share token), never exposed to `anon`.
--   * UK format: sort code (6 digits) + account number (8 digits). Stored as
--     digits only; the UI formats them for display.
--   * Additive and nullable: existing rows are unaffected.
-- =============================================================================

alter table public.workspaces
  add column bank_account_name   text check (bank_account_name is null or char_length(bank_account_name) between 1 and 70),
  add column bank_sort_code      text check (bank_sort_code is null or bank_sort_code ~ '^[0-9]{6}$'),
  add column bank_account_number text check (bank_account_number is null or bank_account_number ~ '^[0-9]{8}$');

-- Bank details are all-or-nothing so a client never sees half a set.
alter table public.workspaces
  add constraint bank_details_complete check (
    (bank_account_name is null and bank_sort_code is null and bank_account_number is null)
    or (bank_account_name is not null and bank_sort_code is not null and bank_account_number is not null)
  );

-- Owners can edit their own bank details (RLS on workspaces already limits rows).
grant update (bank_account_name, bank_sort_code, bank_account_number) on public.workspaces to authenticated;
