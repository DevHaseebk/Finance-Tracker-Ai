-- ============================================================================
-- Schedule generate_due_recurring_transactions() to run daily at 00:05 UTC
-- ============================================================================
create extension if not exists pg_cron;

-- cron.schedule() upserts by job name, so re-running this migration is safe.
select cron.schedule(
  'generate-due-recurring-transactions',
  '5 0 * * *',
  $$select public.generate_due_recurring_transactions();$$
);
