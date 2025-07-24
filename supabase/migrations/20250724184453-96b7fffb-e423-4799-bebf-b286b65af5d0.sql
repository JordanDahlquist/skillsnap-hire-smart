-- Drop all existing INSERT policies for applications
DROP POLICY IF EXISTS "Anon can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Public can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Anonymous users can create applications" ON public.applications;

-- Create proper policies for both anonymous and authenticated users
CREATE POLICY "Anonymous can insert applications"
ON public.applications
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Authenticated can insert applications"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (true);