
-- Add skills_test_responses field to applications table to store test answers
ALTER TABLE applications 
ADD COLUMN skills_test_responses jsonb DEFAULT '[]'::jsonb;

-- Add index for better query performance on skills test responses
CREATE INDEX IF NOT EXISTS idx_applications_skills_test_responses 
ON applications USING gin (skills_test_responses);

-- Add comment for documentation
COMMENT ON COLUMN applications.skills_test_responses IS 'JSON array storing skills test questions and user responses';
