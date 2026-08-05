-- ============================================================================
-- Harden the signup seeding function
-- ============================================================================
-- public.handle_new_user_default_categories() is SECURITY DEFINER and lives in
-- the `public` schema, so PostgREST exposes it at
-- /rest/v1/rpc/handle_new_user_default_categories. Supabase's security linter
-- flags this (lints 0028 / 0029): a SECURITY DEFINER function reachable by the
-- `anon` and `authenticated` roles.
--
-- Only the AFTER INSERT trigger on auth.users should ever invoke it, and the
-- trigger runs as the table owner rather than the calling role, so revoking
-- EXECUTE from client-facing roles closes the RPC surface without affecting
-- signup seeding.
revoke all on function public.handle_new_user_default_categories() from public;
revoke all on function public.handle_new_user_default_categories() from anon;
revoke all on function public.handle_new_user_default_categories() from authenticated;
