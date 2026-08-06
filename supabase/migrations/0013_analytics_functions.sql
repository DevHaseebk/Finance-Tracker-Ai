-- ============================================================================
-- Analytics: category breakdown, monthly income/expense trend, savings trend
-- ============================================================================
-- All three are computed in SQL so the client never pulls raw transaction
-- rows to aggregate in JS, matching the pattern established by
-- get_dashboard_summary(). Every function is security invoker with a pinned
-- search_path, explicitly scoped to auth.uid(), and revoked from public/anon
-- up front (the project has twice hit the gap where Supabase's default
-- privileges grant EXECUTE to anon directly, bypassing a PUBLIC-only revoke —
-- doing all three revokes explicitly here from the start avoids a repeat).

-- ----------------------------------------------------------------------------
-- get_category_breakdown: totals per category for a date range + type
-- ----------------------------------------------------------------------------
create or replace function public.get_category_breakdown(
  p_start date,
  p_end date,
  p_type public.transaction_type
)
returns table (
  category_id uuid,
  name text,
  icon text,
  color text,
  total numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    c.id as category_id,
    c.name,
    c.icon,
    c.color,
    sum(t.amount) as total
  from public.transactions t
  join public.categories c on c.id = t.category_id
  where t.user_id = auth.uid()
    and t.type = p_type
    and t.date between p_start and p_end
  group by c.id, c.name, c.icon, c.color
  order by total desc;
$$;

comment on function public.get_category_breakdown(date, date, public.transaction_type) is
  'Per-category totals for the signed-in user within [p_start, p_end] for one transaction type.';

revoke all on function public.get_category_breakdown(date, date, public.transaction_type) from public;
revoke all on function public.get_category_breakdown(date, date, public.transaction_type) from anon;
grant execute on function public.get_category_breakdown(date, date, public.transaction_type) to authenticated;

-- ----------------------------------------------------------------------------
-- get_monthly_trend: income vs expense per month for the last N months
-- ----------------------------------------------------------------------------
create or replace function public.get_monthly_trend(p_months int default 6)
returns table (
  month date,
  income numeric,
  expense numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with months as (
    select generate_series(
      date_trunc('month', current_date) - ((p_months - 1) || ' months')::interval,
      date_trunc('month', current_date),
      interval '1 month'
    )::date as month
  )
  select
    m.month,
    coalesce(sum(t.amount) filter (where t.type = 'income'), 0) as income,
    coalesce(sum(t.amount) filter (where t.type = 'expense'), 0) as expense
  from months m
  left join public.transactions t
    on date_trunc('month', t.date) = m.month
   and t.user_id = auth.uid()
  group by m.month
  order by m.month;
$$;

comment on function public.get_monthly_trend(int) is
  'Income and expense totals per month for the last p_months months (including months with no transactions), for the signed-in user.';

revoke all on function public.get_monthly_trend(int) from public;
revoke all on function public.get_monthly_trend(int) from anon;
grant execute on function public.get_monthly_trend(int) to authenticated;

-- ----------------------------------------------------------------------------
-- get_savings_trend: cumulative all-time balance as of the end of each month
-- ----------------------------------------------------------------------------
create or replace function public.get_savings_trend(p_months int default 6)
returns table (
  month date,
  balance numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with bounds as (
    select (date_trunc('month', current_date) - ((p_months - 1) || ' months')::interval)::date as window_start
  ),
  months as (
    select generate_series(
      (select window_start from bounds),
      date_trunc('month', current_date)::date,
      interval '1 month'
    )::date as month
  ),
  monthly_net as (
    select
      date_trunc('month', t.date)::date as month,
      sum(case when t.type = 'income' then t.amount else -t.amount end) as net
    from public.transactions t
    where t.user_id = auth.uid()
    group by date_trunc('month', t.date)
  ),
  -- Cumulative balance already carried in before the window starts, so the
  -- trend reflects true all-time growth even though only p_months rows come
  -- back.
  before_window as (
    select coalesce(sum(case when type = 'income' then amount else -amount end), 0) as bal
    from public.transactions
    where user_id = auth.uid()
      and date < (select window_start from bounds)
  ),
  joined as (
    select m.month, coalesce(mn.net, 0) as net
    from months m
    left join monthly_net mn on mn.month = m.month
  )
  select
    month,
    (select bal from before_window)
      + sum(net) over (order by month rows between unbounded preceding and current row) as balance
  from joined
  order by month;
$$;

comment on function public.get_savings_trend(int) is
  'Cumulative all-time balance as of the end of each of the last p_months months, for the signed-in user.';

revoke all on function public.get_savings_trend(int) from public;
revoke all on function public.get_savings_trend(int) from anon;
grant execute on function public.get_savings_trend(int) to authenticated;
