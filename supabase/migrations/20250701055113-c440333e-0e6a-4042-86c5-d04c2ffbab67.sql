
-- Add "Rejected" as a default hiring stage for all existing jobs
INSERT INTO hiring_stages (job_id, name, order_index, color, is_default)
SELECT 
  j.id as job_id,
  'Rejected' as name,
  5 as order_index,
  '#dc2626' as color,
  true as is_default
FROM jobs j
LEFT JOIN hiring_stages h ON j.id = h.job_id AND h.name = 'Rejected'
WHERE h.job_id IS NULL;

-- Update the default hiring stages creation function to include "Rejected"
CREATE OR REPLACE FUNCTION create_default_hiring_stages(job_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert the 5 default hiring stages including Rejected
  INSERT INTO hiring_stages (job_id, name, order_index, color, is_default) VALUES
    (job_id, 'Applied', 1, '#6b7280', true),
    (job_id, 'Under Review', 2, '#f59e0b', true),
    (job_id, 'Interview', 3, '#3b82f6', true),
    (job_id, 'Hired', 4, '#10b981', true),
    (job_id, 'Rejected', 5, '#dc2626', true);
END;
$$;

-- Update existing rejected applications to have pipeline_stage = 'rejected'
UPDATE applications 
SET pipeline_stage = 'rejected', updated_at = now()
WHERE status = 'rejected' AND (pipeline_stage IS NULL OR pipeline_stage != 'rejected');
