-- ============================================================================
-- CashFlow AI — core schema: categories, transactions, RLS, default category seeding
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enum: shared by categories.type and transactions.type
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'transaction_type') then
    create type public.transaction_type as enum ('income', 'expense');
  end if;
end
$$;

-- ----------------------------------------------------------------------------
-- Table: categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  type        public.transaction_type not null,
  icon        text,
  color       text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.categories is 'User-owned income/expense categories.';

-- ----------------------------------------------------------------------------
-- Table: transactions
-- ----------------------------------------------------------------------------
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  type        public.transaction_type not null,
  amount      numeric(12, 2) not null check (amount >= 0),
  note        text,
  date        date not null,
  created_at  timestamptz not null default now()
);

comment on table public.transactions is 'User-owned income/expense transactions.';

-- Primary access pattern: "this user's transactions, most recent first / by range".
create index if not exists transactions_user_id_date_idx
  on public.transactions (user_id, date);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- categories: owners can fully manage their own rows
drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own"
  on public.categories for select
  using (auth.uid() = user_id);

drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own"
  on public.categories for insert
  with check (auth.uid() = user_id);

drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own"
  on public.categories for delete
  using (auth.uid() = user_id);

-- transactions: owners can fully manage their own rows
drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Seed 8 default categories for every new user
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, type, icon, color, is_default)
  values
    (new.id, 'Salary',         'income',  'briefcase',      '#16A34A', true),
    (new.id, 'Freelance',      'income',  'laptop',         '#0EA5E9', true),
    (new.id, 'Investments',    'income',  'trending-up',    '#4F46E5', true),
    (new.id, 'Food & Dining',  'expense', 'utensils',       '#D97706', true),
    (new.id, 'Transportation', 'expense', 'car',            '#0891B2', true),
    (new.id, 'Shopping',       'expense', 'shopping-bag',   '#DB2777', true),
    (new.id, 'Bills & Utilities', 'expense', 'receipt',     '#DC2626', true),
    (new.id, 'Entertainment',  'expense', 'popcorn',        '#7C3AED', true);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_seed_categories on auth.users;
create trigger on_auth_user_created_seed_categories
  after insert on auth.users
  for each row
  execute function public.handle_new_user_default_categories();
