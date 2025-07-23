-- FINAL FIX: Properly grant anon role access to applications table
-- First, ensure anon role has proper schema access
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.applications TO anon;

-- Drop ALL existing policies for applications
DROP POLICY IF EXISTS "Anyone can create applications" ON public.applications;

-- Create the policy with explicit role targeting
-- Using TO clause with both roles explicitly listed
CREATE POLICY "Anonymous users can create applications" 
ON public.applications 
FOR INSERT 
TO anon, public
WITH CHECK (true);

-- Verify the policy was created correctly by checking
-- that both anon and public roles are included