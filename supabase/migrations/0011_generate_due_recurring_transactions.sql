-- ============================================================================
-- generate_due_recurring_transactions(): create today's due transactions
-- ============================================================================
-- Intended to run once daily via pg_cron (see 0012). Internal/system function
-- only — not part of the client API surface.
create or replace function public.generate_due_recurring_transactions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today       date := current_date;
  v_count       integer := 0;
  v_inserted    integer;
  v_is_due      boolean;
  v_target_day  int;
  v_days_in_mo  int;
  r             record;
begin
  -- Candidates: active, within their start/end window, and not already
  -- generated today. This alone makes re-running later the same day a no-op
  -- for anything it already handled.
  for r in
    select *
    from public.recurring_transactions
    where is_active
      and start_date <= v_today
      and (end_date is null or end_date >= v_today)
      and (last_generated_date is null or last_generated_date < v_today)
  loop
    v_is_due := false;

    if r.frequency = 'daily' then
      v_is_due := true;
    elsif r.frequency = 'weekly' then
      v_is_due := extract(dow from v_today)::int = r.day_of_week;
    elsif r.frequency = 'monthly' then
      -- Clamp to the last day of the month when day_of_month doesn't exist
      -- in it (e.g. a "31st" rule fires on Feb 28/29, Apr/Jun/Sep/Nov 30).
      v_days_in_mo := extract(day from (date_trunc('month', v_today) + interval '1 month - 1 day'))::int;
      v_target_day := least(r.day_of_month, v_days_in_mo);
      v_is_due := extract(day from v_today)::int = v_target_day;
    end if;

    if not v_is_due then
      continue;
    end if;

    -- Belt-and-suspenders idempotency: even if this ran twice concurrently,
    -- the unique index on (recurring_id, date) makes the second insert a
    -- no-op instead of a duplicate transaction.
    insert into public.transactions (user_id, category_id, recurring_id, type, amount, note, date)
    values (r.user_id, r.category_id, r.id, r.type, r.amount, r.note, v_today)
    on conflict (recurring_id, date) where recurring_id is not null do nothing;

    get diagnostics v_inserted = row_count;

    update public.recurring_transactions
    set last_generated_date = v_today
    where id = r.id;

    if v_inserted > 0 then
      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end;
$$;

comment on function public.generate_due_recurring_transactions() is
  'Generates today''s due transactions from active recurring rules. Run daily via pg_cron; safe to run more than once a day.';

-- System-internal only: never callable by app users, anon or authenticated.
revoke all on function public.generate_due_recurring_transactions() from public;
revoke all on function public.generate_due_recurring_transactions() from anon;
revoke all on function public.generate_due_recurring_transactions() from authenticated;
