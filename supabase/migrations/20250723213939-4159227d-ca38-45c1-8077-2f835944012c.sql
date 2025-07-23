-- Comprehensive fix for anonymous application submissions
-- Drop the existing policy completely
DROP POLICY IF EXISTS "Anyone can create applications" ON public.applications;

-- Create a proper policy that explicitly allows both anon and public roles
-- This fixes the role inheritance issue
CREATE POLICY "Anyone can create applications" 
ON public.applications 
FOR INSERT 
TO anon, public
WITH CHECK (true);

-- Ensure the applications table has proper defaults for required fields
-- Update any missing defaults that could cause insertion failures
ALTER TABLE public.applications 
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now(),
ALTER COLUMN status SET DEFAULT 'pending';