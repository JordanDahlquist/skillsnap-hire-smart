-- Re-enable RLS on applications table  
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Re-create the essential RLS policies for applications
CREATE POLICY "Job owners can view applications" ON public.applications
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM jobs 
  WHERE jobs.id = applications.job_id 
  AND jobs.user_id = auth.uid()
));

CREATE POLICY "Job owners can update applications" ON public.applications
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM jobs 
  WHERE jobs.id = applications.job_id 
  AND jobs.user_id = auth.uid()
));

CREATE POLICY "Job owners can delete applications" ON public.applications
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM jobs 
  WHERE jobs.id = applications.job_id 
  AND jobs.user_id = auth.uid()
));

-- Allow public application submissions to active jobs
CREATE POLICY "Public can submit applications to active jobs" ON public.applications
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM jobs 
  WHERE jobs.id = applications.job_id 
  AND jobs.status = 'active'
));