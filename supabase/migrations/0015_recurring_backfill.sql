-- ============================================================================
-- Recurring backfill: catch up missed occurrences, not just "is today due"
-- ============================================================================
-- generate_due_recurring_transactions() only ever checked whether *today*
-- was a due day and inserted a single row for current_date. That meant a
-- rule created with a start_date in the past (e.g. created today with a
-- start date a couple of days ago) never got that backlog generated — the
-- function has no concept of "catch up from where I left off". The daily
-- cron has the same gap: if it ever misses a day (downtime, a paused
-- project), that day's occurrences are gone for good rather than picked up
-- on the next run.
--
-- Fix: a shared internal helper walks every date from
-- greatest(start_date, last_generated_date + 1) through today (inclusive,
-- bounded by end_date) and generates whichever of those were actually due.
-- Both the cron function and a new client-callable RPC — invoked right after
-- a rule is created, so its transactions show up immediately instead of
-- waiting for tomorrow's cron — now go through this one code path.

-- ----------------------------------------------------------------------------
-- _generate_occurrences_for_rule: internal, not exposed to any client role
-- ----------------------------------------------------------------------------
create or replace function public._generate_occurrences_for_rule(r public.recurring_transactions)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today       date := current_date;
  v_cursor      date;
  v_count       integer := 0;
  v_inserted    integer;
  v_is_due      boolean;
  v_target_day  int;
  v_days_in_mo  int;
begin
  if not r.is_active or r.start_date > v_today then
    return 0;
  end if;

  v_cursor := greatest(r.start_date, coalesce(r.last_generated_date + 1, r.start_date));

  while v_cursor <= v_today and (r.end_date is null or v_cursor <= r.end_date) loop
    v_is_due := false;

    if r.frequency = 'daily' then
      v_is_due := true;
    elsif r.frequency = 'weekly' then
      v_is_due := extract(dow from v_cursor)::int = r.day_of_week;
    elsif r.frequency = 'monthly' then
      -- Clamp to the last day of the month when day_of_month doesn't exist
      -- in it (e.g. a "31st" rule fires on Feb 28/29, Apr/Jun/Sep/Nov 30).
      v_days_in_mo := extract(day from (date_trunc('month', v_cursor) + interval '1 month - 1 day'))::int;
      v_target_day := least(r.day_of_month, v_days_in_mo);
      v_is_due := extract(day from v_cursor)::int = v_target_day;
    end if;

    if v_is_due then
      -- Belt-and-suspenders idempotency: even if this ran twice concurrently,
      -- the unique index on (recurring_id, date) makes the second insert a
      -- no-op instead of a duplicate transaction.
      insert into public.transactions (user_id, category_id, recurring_id, type, amount, note, date)
      values (r.user_id, r.category_id, r.id, r.type, r.amount, r.note, v_cursor)
      on conflict (recurring_id, date) where recurring_id is not null do nothing;

      get diagnostics v_inserted = row_count;
      if v_inserted > 0 then
        v_count := v_count + 1;
      end if;
    end if;

    v_cursor := v_cursor + 1;
  end loop;

  update public.recurring_transactions
  set last_generated_date = v_today
  where id = r.id;

  return v_count;
end;
$$;

comment on function public._generate_occurrences_for_rule(public.recurring_transactions) is
  'Internal: backfills one rule''s missing occurrences from its cursor date through today. Shared by the daily cron job and generate_recurring_backfill_for_rule().';

revoke all on function public._generate_occurrences_for_rule(public.recurring_transactions) from public;
revoke all on function public._generate_occurrences_for_rule(public.recurring_transactions) from anon;
revoke all on function public._generate_occurrences_for_rule(public.recurring_transactions) from authenticated;

-- ----------------------------------------------------------------------------
-- generate_due_recurring_transactions: cron entry point (system-internal)
-- ----------------------------------------------------------------------------
create or replace function public.generate_due_recurring_transactions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today  date := current_date;
  v_count  integer := 0;
  -- Must be typed as the composite row, not `record` — a FOR loop over
  -- `select *` into a plain `record` won't implicitly cast when passed to
  -- _generate_occurrences_for_rule(public.recurring_transactions), and Postgres
  -- raises "cannot cast type record to recurring_transactions" at call time.
  r        public.recurring_transactions;
begin
  for r in
    select *
    from public.recurring_transactions
    where is_active
      and start_date <= v_today
      and (end_date is null or end_date >= v_today)
      and (last_generated_date is null or last_generated_date < v_today)
  loop
    v_count := v_count + public._generate_occurrences_for_rule(r);
  end loop;

  return v_count;
end;
$$;

comment on function public.generate_due_recurring_transactions() is
  'Backfills every active rule''s missing occurrences up through today. Run daily via pg_cron; safe to run more than once a day or after a missed run.';

revoke all on function public.generate_due_recurring_transactions() from public;
revoke all on function public.generate_due_recurring_transactions() from anon;
revoke all on function public.generate_due_recurring_transactions() from authenticated;

-- ----------------------------------------------------------------------------
-- generate_recurring_backfill_for_rule: client-callable, owner-scoped
-- ----------------------------------------------------------------------------
-- Called by the app right after a recurring rule is created, so a start_date
-- in the past (or even today, if the day's cron run already happened) is
-- reflected immediately instead of waiting for tomorrow's cron.
create or replace function public.generate_recurring_backfill_for_rule(p_recurring_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.recurring_transactions;
begin
  select * into r
  from public.recurring_transactions
  where id = p_recurring_id
    and user_id = auth.uid();

  if not found then
    return 0;
  end if;

  return public._generate_occurrences_for_rule(r);
end;
$$;

comment on function public.generate_recurring_backfill_for_rule(uuid) is
  'Backfills the caller''s own recurring rule immediately after creation/edit. Owner-checked via auth.uid() — returns 0 for a rule that does not belong to the caller.';

revoke all on function public.generate_recurring_backfill_for_rule(uuid) from public;
revoke all on function public.generate_recurring_backfill_for_rule(uuid) from anon;
grant execute on function public.generate_recurring_backfill_for_rule(uuid) to authenticated;
