-- ============================================================================
-- Fix: get_dashboard_summary was still callable by anon
-- ============================================================================
-- Supabase's default privileges grant EXECUTE on new public-schema functions
-- directly to anon, authenticated and service_role individually (not only via
-- the PUBLIC pseudo-role), so `revoke all ... from public` in 0006 alone did
-- not remove anon's own direct grant. Harmless in practice — auth.uid() is
-- null for anon, so every sum comes back zero — but it contradicts the
-- function's stated intent and the principle of least privilege.
revoke all on function public.get_dashboard_summary() from anon;
