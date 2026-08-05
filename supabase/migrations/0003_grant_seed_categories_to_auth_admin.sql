-- ============================================================================
-- Fix: restore EXECUTE for supabase_auth_admin on the signup seeding function
-- ============================================================================
-- 0002 ran `revoke all ... from public` to close the PostgREST RPC surface on
-- handle_new_user_default_categories(). That also removed the grant that
-- supabase_auth_admin was relying on — it had EXECUTE only via PUBLIC.
--
-- supabase_auth_admin is the role GoTrue uses when it inserts into auth.users,
-- so without EXECUTE the AFTER INSERT trigger raises a permission error and
-- real signups fail with "Database error saving new user". Seeding via a
-- direct SQL insert still worked, because that runs as postgres (the function
-- owner), which is why the original 0002 verification did not catch this.
--
-- Grant EXECUTE back to supabase_auth_admin only. anon and authenticated stay
-- revoked, so the function remains unreachable via /rest/v1/rpc/.
grant execute on function public.handle_new_user_default_categories()
  to supabase_auth_admin;
