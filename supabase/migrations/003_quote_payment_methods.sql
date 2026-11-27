-- =============================================================================
-- SayPay — 003_quote_payment_methods.sql
-- Each quote chooses how the client can pay: card (Stripe) and/or bank transfer.
-- Additive with defaults, so existing quotes keep offering everything that the
-- business has set up.
-- =============================================================================

alter table public.quotes
  add column accept_card boolean not null default true,
  add column accept_bank boolean not null default true;

-- Contractors set these when creating or editing a quote (RLS limits rows).
grant insert (accept_card, accept_bank) on public.quotes to authenticated;
grant update (accept_card, accept_bank) on public.quotes to authenticated;
