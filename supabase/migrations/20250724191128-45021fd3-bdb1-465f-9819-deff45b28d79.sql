-- Drop all existing INSERT policies for applications table
DROP POLICY IF EXISTS "Anon can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Public can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Anonymous users can create applications" ON public.applications;
DROP POLICY IF EXISTS "Anonymous can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Authenticated can insert applications" ON public.applications;

-- Create single policy for all users using TO public (covers both anon and authenticated)
CREATE POLICY "Public can insert applications"
ON public.applications
FOR INSERT
TO public
WITH CHECK (true);