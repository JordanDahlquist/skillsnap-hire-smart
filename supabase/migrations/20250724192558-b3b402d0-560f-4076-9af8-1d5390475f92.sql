-- Disable RLS on applications table for public job submissions
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies on applications table
DROP POLICY IF EXISTS "Public can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Users can view applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Users can update applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Allow application submission for valid jobs" ON public.applications;
DROP POLICY IF EXISTS "Allow all application inserts" ON public.applications;