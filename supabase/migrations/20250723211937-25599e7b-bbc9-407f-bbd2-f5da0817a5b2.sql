-- Fix the applications table RLS policy for insertions
-- Drop the existing incorrect policy
DROP POLICY IF EXISTS "Anyone can create applications" ON public.applications;

-- Create a new policy with proper SQL expression that allows anyone to submit applications
CREATE POLICY "Anyone can create applications" 
ON public.applications 
FOR INSERT 
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = applications.job_id 
    AND jobs.status = 'active'
  )
);