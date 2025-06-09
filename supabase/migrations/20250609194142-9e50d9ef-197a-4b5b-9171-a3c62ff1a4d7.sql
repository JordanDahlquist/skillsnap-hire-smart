
-- Create a function to generate default hiring stages for a job
CREATE OR REPLACE FUNCTION create_default_hiring_stages(job_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert the 4 default hiring stages
  INSERT INTO hiring_stages (job_id, name, order_index, color, is_default) VALUES
    (job_id, 'Applied', 1, '#6b7280', true),
    (job_id, 'Under Review', 2, '#f59e0b', true),
    (job_id, 'Interview', 3, '#3b82f6', true),
    (job_id, 'Hired', 4, '#10b981', true);
END;
$$;

-- Create a trigger function that will be called after job insertion
CREATE OR REPLACE FUNCTION trigger_create_default_hiring_stages()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create default hiring stages for the new job
  PERFORM create_default_hiring_stages(NEW.id);
  RETURN NEW;
END;
$$;

-- Create the trigger that fires after job insertion
DROP TRIGGER IF EXISTS after_job_insert_create_stages ON jobs;
CREATE TRIGGER after_job_insert_create_stages
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_default_hiring_stages();

-- Backfill existing jobs that don't have any hiring stages
INSERT INTO hiring_stages (job_id, name, order_index, color, is_default)
SELECT 
  j.id as job_id,
  stage_data.name,
  stage_data.order_index,
  stage_data.color,
  stage_data.is_default
FROM jobs j
CROSS JOIN (
  VALUES 
    ('Applied', 1, '#6b7280', true),
    ('Under Review', 2, '#f59e0b', true),
    ('Interview', 3, '#3b82f6', true),
    ('Hired', 4, '#10b981', true)
) AS stage_data(name, order_index, color, is_default)
LEFT JOIN hiring_stages h ON j.id = h.job_id
WHERE h.job_id IS NULL;
