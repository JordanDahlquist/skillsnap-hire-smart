-- Create a new migration to properly fix the applications RLS policy
-- Drop the existing policy completely
DROP POLICY IF EXISTS "Anyone can create applications" ON public.applications;

-- Create a simple policy that allows all insertions for anonymous users
CREATE POLICY "Anyone can create applications" 
ON public.applications 
FOR INSERT 
TO public
WITH CHECK (true);