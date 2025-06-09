
-- Update the applications table to set default pipeline_stage to 'applied'
ALTER TABLE public.applications ALTER COLUMN pipeline_stage SET DEFAULT 'applied';

-- Update existing applications that have null or invalid pipeline_stage values to 'applied'
UPDATE public.applications 
SET pipeline_stage = 'applied', updated_at = now()
WHERE pipeline_stage IS NULL;

-- Update applications where pipeline_stage doesn't match any existing hiring stage for that job
UPDATE public.applications 
SET pipeline_stage = 'applied', updated_at = now()
WHERE pipeline_stage NOT IN (
  SELECT DISTINCT lower(replace(name, ' ', '_'))
  FROM hiring_stages 
  WHERE job_id = applications.job_id
)
AND pipeline_stage IS NOT NULL;
