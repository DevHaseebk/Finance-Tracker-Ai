-- Pin search_path on the delete-guard trigger function (added in 0004),
-- matching the convention used on get_dashboard_summary and the signup
-- seeding function. Without it, the linter flags a mutable search_path
-- (0011): a caller could in theory shadow `public` with a same-named object
-- earlier in their session search_path and influence function resolution
-- inside the trigger. The function only references OLD/auth built-ins, so
-- risk here was low, but pinning it is free and keeps every
-- SECURITY-relevant function in this schema consistent.
alter function public.prevent_default_category_delete() set search_path = public;
