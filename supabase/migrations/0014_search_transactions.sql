-- ============================================================================
-- search_transactions: paginated, filterable transaction history
-- ============================================================================
-- Backs the History screen's month/year filter, category filter, and note-or-
-- amount search box, all combined server-side with LIMIT/OFFSET pagination —
-- the client never loads more of the table than the current page.
create or replace function public.search_transactions(
  p_year int default null,
  p_month int default null,
  p_category_id uuid default null,
  p_search text default null,
  p_limit int default 30,
  p_offset int default 0
)
returns table (
  id uuid,
  user_id uuid,
  category_id uuid,
  type public.transaction_type,
  amount numeric,
  note text,
  date date,
  created_at timestamptz,
  recurring_id uuid,
  category_name text,
  category_icon text,
  category_color text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    t.id, t.user_id, t.category_id, t.type, t.amount, t.note, t.date, t.created_at, t.recurring_id,
    c.name as category_name, c.icon as category_icon, c.color as category_color
  from public.transactions t
  join public.categories c on c.id = t.category_id
  where t.user_id = auth.uid()
    and (p_year is null or extract(year from t.date) = p_year)
    and (p_month is null or extract(month from t.date) = p_month)
    and (p_category_id is null or t.category_id = p_category_id)
    and (
      p_search is null or btrim(p_search) = '' or
      t.note ilike '%' || p_search || '%' or
      t.amount::text ilike '%' || p_search || '%'
    )
  order by t.date desc, t.created_at desc
  limit p_limit offset p_offset;
$$;

comment on function public.search_transactions(int, int, uuid, text, int, int) is
  'Paginated, filterable transaction history for the signed-in user: optional year/month, category and note-or-amount search.';

revoke all on function public.search_transactions(int, int, uuid, text, int, int) from public;
revoke all on function public.search_transactions(int, int, uuid, text, int, int) from anon;
grant execute on function public.search_transactions(int, int, uuid, text, int, int) to authenticated;
