-- Drop the existing faulty policy
DROP POLICY IF EXISTS "Anonymous users can create applications" ON public.applications;

-- Grant explicit permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.applications TO anon;

-- Create separate policies for each role
-- Policy for anonymous users
CREATE POLICY "Anon can insert applications"
ON public.applications
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy for authenticated users
CREATE POLICY "Public can insert applications"
ON public.applications
FOR INSERT
TO public
WITH CHECK (true);