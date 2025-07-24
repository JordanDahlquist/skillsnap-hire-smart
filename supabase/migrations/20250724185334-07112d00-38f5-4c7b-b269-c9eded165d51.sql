-- Drop all existing INSERT policies for applications
DROP POLICY IF EXISTS "Anon can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Public can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Anonymous users can create applications" ON public.applications;
DROP POLICY IF EXISTS "Anonymous can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Authenticated can insert applications" ON public.applications;

-- Create proper policies for both anonymous and authenticated users with reliable conditions
CREATE POLICY "Anonymous can insert applications"
ON public.applications
FOR INSERT
TO anon
WITH CHECK (1=1);

CREATE POLICY "Authenticated can insert applications"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (1=1);