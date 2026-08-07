-- ============================================================================
-- Starting balance: a manually-entered balance carried in from before the
-- user started tracking in this app
-- ============================================================================
-- Every balance figure (Dashboard's total, the savings trend chart) was
-- previously computed purely from summed transactions, with no way to tell
-- the app "I already had this much before I started using it". This adds a
-- one-row-per-user settings table holding that figure, then folds it into
-- get_dashboard_summary() and get_savings_trend() as a baseline.

create table if not exists public.user_settings (
  user_id           uuid primary key references auth.users (id) on delete cascade,
  starting_balance  numeric(12, 2) not null default 0,
  updated_at        timestamptz not null default now()
);

comment on table public.user_settings is
  'Per-user app settings. One row per user, upserted from the client.';
comment on column public.user_settings.starting_balance is
  'Balance carried in from before the user started tracking in this app. Folded as a baseline into get_dashboard_summary() and get_savings_trend() — never shown as a transaction.';

-- ----------------------------------------------------------------------------
-- RLS — same owner-scoped pattern as categories/transactions/recurring rules
-- ----------------------------------------------------------------------------
alter table public.user_settings enable row level security;

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- get_dashboard_summary: fold starting_balance into balance + carried_before
-- ----------------------------------------------------------------------------
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
  settings as (
    select coalesce(
      (select starting_balance from public.user_settings where user_id = auth.uid()),
      0
    ) as starting_balance
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
    total_income - total_expense + (select starting_balance from settings) as balance,
    before_income - before_expense + (select starting_balance from settings) as carried_before,
    month_income,
    month_expense,
    month_income - month_expense as month_net
  from totals;
$$;

comment on function public.get_dashboard_summary() is
  'Cumulative balance (including any manually-entered starting_balance) and this-month income/expense/net for the signed-in user, aggregated in SQL.';

-- ----------------------------------------------------------------------------
-- get_savings_trend: fold starting_balance into the pre-window baseline
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
  -- Cumulative balance already carried in before the window starts — the
  -- manually-entered starting_balance plus every transaction before it — so
  -- the trend reflects true all-time growth even though only p_months rows
  -- come back.
  before_window as (
    select
      coalesce(sum(case when type = 'income' then amount else -amount end), 0)
        + coalesce((select starting_balance from public.user_settings where user_id = auth.uid()), 0)
        as bal
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
  'Cumulative all-time balance (including any manually-entered starting_balance) as of the end of each of the last p_months months, for the signed-in user.';
