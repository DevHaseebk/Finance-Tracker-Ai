-- ============================================================================
-- Categories: hide/disable support + guard against deleting defaults
-- ============================================================================
-- Default categories (is_default = true) must not be deletable — only
-- hideable — so users can decide not to see "Freelance" without losing the
-- seeded row (and without risking an accidental delete of something other
-- rows may still reference).

alter table public.categories
  add column if not exists is_hidden boolean not null default false;

comment on column public.categories.is_hidden is
  'User has hidden this category from pickers/lists. Defaults are hidden, not deleted.';

-- Defense in depth: enforce the "defaults can't be deleted" rule at the
-- database level, not just in application code, so it holds even for direct
-- SQL/API access.
create or replace function public.prevent_default_category_delete()
returns trigger
language plpgsql
as $$
begin
  if old.is_default then
    raise exception 'Default categories cannot be deleted; hide them instead.'
      using errcode = '23514'; -- check_violation
  end if;
  return old;
end;
$$;

drop trigger if exists prevent_default_category_delete on public.categories;
create trigger prevent_default_category_delete
  before delete on public.categories
  for each row
  execute function public.prevent_default_category_delete();
