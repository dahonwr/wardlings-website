-- Migration: Close whitelist submissions at the database level.
--
-- NON-DESTRUCTIVE. Does not touch, modify, or delete a single row,
-- column, or table. It only replaces the RLS policies on two tables.
--
-- REVISED: the first draft of this migration kept a public SELECT
-- policy (`USING (true)`) so existing lookups would keep working. On
-- review that's unsafe for this table specifically — with no login/
-- session system in this app (no supabase.auth usage anywhere), RLS has
-- no identity to scope "your own row" against, so `USING (true)` really
-- means "anyone can read all 6,200+ rows in full, unfiltered." The
-- currently-deployed frontend (whitelist already shows the closed-state
-- card) does not need any public read access to this table right now,
-- so this version grants NONE — no SELECT, INSERT, UPDATE, or DELETE —
-- to the anon/public role on either table. With RLS enabled and no
-- policy defined for an operation, Postgres denies it by default.
--
-- Server-side/service-role access (Supabase Studio, or a future admin
-- panel using the service_role key) is completely unaffected — the
-- service role bypasses RLS entirely by design and must only ever be
-- used server-side, never shipped in frontend code.
--
-- If you later want applicants to self-serve "check my status by
-- handle/wallet," do NOT reopen public SELECT for that — build a
-- Supabase Edge Function that uses the service-role key server-side,
-- accepts a handle/wallet, and returns only a minimal status payload.
-- That keeps the underlying table fully private while still supporting
-- the lookup.

-- 1. whitelist_applications: drop the "allow everything" policy and
--    replace it with nothing — RLS then denies all access to the
--    public/anon role by default (SELECT included).
DROP POLICY IF EXISTS "Allow public read/insert/update on whitelist_applications" ON public.whitelist_applications;

-- (No replacement policy is created — this is intentional. See notes above.)

-- 2. task_progress: same treatment, for the same reason — new
--    applications also write their first task_progress rows during the
--    funnel, so this needs closing too or someone could still create
--    task rows even with whitelist_applications locked down. It's
--    equally sensitive to expose (ties task completion to an
--    application_id), so it gets the same "no public policy" treatment.
DROP POLICY IF EXISTS "Allow public read/insert/update on task_progress" ON public.task_progress;

-- 3. admin_notes is untouched here — it's only ever written from the
--    (currently unused) admin dashboard, not from the public submission
--    flow, so it's out of scope for "closing the whitelist."

-- Rollback, if you ever need to reopen the old (fully public) behavior:
--   CREATE POLICY "Allow public read/insert/update on whitelist_applications"
--     ON public.whitelist_applications FOR ALL USING (true) WITH CHECK (true);
--   CREATE POLICY "Allow public read/insert/update on task_progress"
--     ON public.task_progress FOR ALL USING (true) WITH CHECK (true);
