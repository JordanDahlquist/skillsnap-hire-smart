-- Fix the applications table RLS policy for anonymous insertions
-- Drop the existing policy that may fail in anonymous context
DROP POLICY IF EXISTS "Anyone can create applications" ON public.applications;

-- Create a simplified policy that allows anonymous users to create applications
-- We'll move job validation to application code for better error handling
CREATE POLICY "Anyone can create applications" 
ON public.applications 
FOR INSERT 
TO public
WITH CHECK (true);