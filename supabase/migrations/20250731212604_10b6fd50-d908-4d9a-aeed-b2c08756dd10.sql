-- Add missing public INSERT policy for applications
CREATE POLICY "Anyone can create applications" 
ON public.applications 
FOR INSERT 
TO public
WITH CHECK (true);