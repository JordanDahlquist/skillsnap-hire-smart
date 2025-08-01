-- Drop the existing check constraint
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Add the updated check constraint that includes 'archived'
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived'));