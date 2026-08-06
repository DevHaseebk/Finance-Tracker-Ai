-- ============================================================================
-- Fix: the 0004 delete guard blocked account deletion entirely
-- ============================================================================
-- prevent_default_category_delete() had no role check, so it fired for EVERY
-- delete of an is_default row — including the ON DELETE CASCADE fired when
-- categories.user_id cascades from a deleted auth.users row. Since every
-- user has default categories (seeded on signup), deleting any account
-- failed with "Default categories cannot be deleted; hide them instead."
--
-- The guard should only stop a normal end-user session from deleting a
-- default category directly — PostgREST requests run as the `authenticated`
-- role. Cascade deletes from account deletion run as supabase_auth_admin (or
-- postgres for admin/dashboard access) and must be allowed through.
create or replace function public.prevent_default_category_delete()
returns trigger
language plpgsql
as $$
begin
  if old.is_default and current_user = 'authenticated' then
    raise exception 'Default categories cannot be deleted; hide them instead.'
      using errcode = '23514';
  end if;
  return old;
end;
$$;
