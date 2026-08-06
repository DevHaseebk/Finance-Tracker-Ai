-- ============================================================================
-- Dashboard summary aggregate
-- ============================================================================
-- Returns the cumulative balance plus a this-month/before-this-month split,
-- all computed in the database so the client never pulls the full
-- transactions table just to sum it in JS.
create or replace function public.get_dashboard_summary()
returns table (
  total_income numeric,
  total_expense numeric,
  balance numeric,
  carried_before numeric,
  month_income numeric,
  month_expense numeric,
  month_net numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with month_start as (
    select date_trunc('month', now())::date as d
  ),
  totals as (
    select
      coalesce(sum(amount) filter (where type = 'income'), 0) as total_income,
      coalesce(sum(amount) filter (where type = 'expense'), 0) as total_expense,
      coalesce(sum(amount) filter (
        where type = 'income' and date < (select d from month_start)
      ), 0) as before_income,
      coalesce(sum(amount) filter (
        where type = 'expense' and date < (select d from month_start)
      ), 0) as before_expense,
      coalesce(sum(amount) filter (
        where type = 'income' and date >= (select d from month_start)
      ), 0) as month_income,
      coalesce(sum(amount) filter (
        where type = 'expense' and date >= (select d from month_start)
      ), 0) as month_expense
    from public.transactions
    -- Explicit filter in addition to RLS: makes the function's intent clear
    -- and keeps it correct even if it were ever called with elevated rights.
    where user_id = auth.uid()
  )
  select
    total_income,
    total_expense,
    total_income - total_expense as balance,
    before_income - before_expense as carried_before,
    month_income,
    month_expense,
    month_income - month_expense as month_net
  from totals;
$$;

comment on function public.get_dashboard_summary() is
  'Cumulative balance and this-month income/expense/net for the signed-in user, aggregated in SQL.';

-- Callable only by signed-in app users, not anon.
revoke all on function public.get_dashboard_summary() from public;
grant execute on function public.get_dashboard_summary() to authenticated;
