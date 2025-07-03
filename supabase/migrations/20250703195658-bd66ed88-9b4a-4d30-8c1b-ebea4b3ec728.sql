
-- Add a column to track the previous pipeline stage before rejection
ALTER TABLE public.applications 
ADD COLUMN previous_pipeline_stage text;

-- Create an index for better query performance
CREATE INDEX idx_applications_previous_pipeline_stage 
ON public.applications(previous_pipeline_stage);
