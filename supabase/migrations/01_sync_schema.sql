-- SQL Migration: Synchronize whitelist_applications schema and helper tables
-- Run this in the Supabase SQL Editor if you wish to persist updated_at, current_step, completed, task_progress, and admin_notes in the database.

-- 1. Add missing columns to whitelist_applications if required
ALTER TABLE IF EXISTS public.whitelist_applications 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- 2. Create task_progress table if missing
CREATE TABLE IF NOT EXISTS public.task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.whitelist_applications(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create admin_notes table if missing
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.whitelist_applications(id) ON DELETE CASCADE,
  notes TEXT,
  reviewed_by TEXT DEFAULT 'admin',
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on newly created tables with public access policies
ALTER TABLE public.whitelist_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/insert/update on whitelist_applications" 
  ON public.whitelist_applications FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read/insert/update on task_progress" 
  ON public.task_progress FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read/insert/update on admin_notes" 
  ON public.admin_notes FOR ALL USING (true) WITH CHECK (true);
