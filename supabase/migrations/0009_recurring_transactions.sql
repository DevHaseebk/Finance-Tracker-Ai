-- ============================================================================
-- Recurring transactions: rules that auto-generate real transactions
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'recurring_frequency') then
    create type public.recurring_frequency as enum ('daily', 'weekly', 'monthly');
  end if;
end
$$;

create table if not exists public.recurring_transactions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  category_id           uuid not null references public.categories (id) on delete restrict,
  type                  public.transaction_type not null,
  amount                numeric(12, 2) not null check (amount >= 0),
  note                  text,
  frequency             public.recurring_frequency not null,
  day_of_month          int,
  day_of_week           int,
  start_date            date not null,
  end_date              date,
  is_active             boolean not null default true,
  last_generated_date   date,
  created_at            timestamptz not null default now(),

  constraint recurring_transactions_day_of_month_range
    check (day_of_month is null or day_of_month between 1 and 31),
  constraint recurring_transactions_day_of_week_range
    check (day_of_week is null or day_of_week between 0 and 6),
  constraint recurring_transactions_end_after_start
    check (end_date is null or end_date >= start_date),
  -- Exactly the field its frequency needs, and no other: daily uses neither,
  -- weekly needs day_of_week, monthly needs day_of_month.
  constraint recurring_transactions_frequency_fields
    check (
      (frequency = 'daily'   and day_of_month is null     and day_of_week is null) or
      (frequency = 'weekly'  and day_of_week is not null  and day_of_month is null) or
      (frequency = 'monthly' and day_of_month is not null and day_of_week is null)
    )
);

comment on table public.recurring_transactions is
  'User-defined recurring income/expense rules that auto-generate transactions.';
comment on column public.recurring_transactions.day_of_week is
  '0=Sunday..6=Saturday, matches Postgres extract(dow from date).';
comment on column public.recurring_transactions.last_generated_date is
  'Date generate_due_recurring_transactions() last created a transaction for this rule.';

create index if not exists recurring_transactions_user_id_idx
  on public.recurring_transactions (user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security — same owner-scoped pattern as categories/transactions
-- ----------------------------------------------------------------------------
alter table public.recurring_transactions enable row level security;

drop policy if exists "recurring_transactions_select_own" on public.recurring_transactions;
create policy "recurring_transactions_select_own"
  on public.recurring_transactions for select
  using (auth.uid() = user_id);

drop policy if exists "recurring_transactions_insert_own" on public.recurring_transactions;
create policy "recurring_transactions_insert_own"
  on public.recurring_transactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "recurring_transactions_update_own" on public.recurring_transactions;
create policy "recurring_transactions_update_own"
  on public.recurring_transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "recurring_transactions_delete_own" on public.recurring_transactions;
create policy "recurring_transactions_delete_own"
  on public.recurring_transactions for delete
  using (auth.uid() = user_id);
