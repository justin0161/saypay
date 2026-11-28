-- =============================================================================
-- SayPay — 004_hardening.sql
-- Pre-launch tidy-up from the Supabase security/performance advisors.
-- =============================================================================

-- 1. Pin search_path on trigger functions (advisor: function_search_path_mutable).
alter function public.set_updated_at() set search_path = '';
alter function public.quotes_guard() set search_path = '';

-- 2. SECURITY DEFINER functions must not be callable by signed-out visitors.
--    Trigger functions are never called directly, so nobody needs EXECUTE
--    (Postgres doesn't check it when a trigger fires).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_quote_last_message() from public, anon, authenticated;

--    Ownership helpers are used by RLS and storage policies for signed-in users,
--    so they stay available to `authenticated` but not to anyone else.
revoke execute on function public.is_workspace_owner(uuid) from public, anon;
revoke execute on function public.owns_quote(uuid) from public, anon;
revoke execute on function public.owns_storage_folder(text) from public, anon;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
grant execute on function public.owns_quote(uuid) to authenticated;
grant execute on function public.owns_storage_folder(text) to authenticated;

-- 3. Cover the attachment foreign key on messages (advisor: unindexed_foreign_keys).
create index if not exists quote_messages_attachment_idx on public.quote_messages (attachment_id);
