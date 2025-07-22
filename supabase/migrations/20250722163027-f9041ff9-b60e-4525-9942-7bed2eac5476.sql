
-- Add resume_summary field to applications table
ALTER TABLE applications ADD COLUMN resume_summary TEXT;

-- Add index for better performance when searching summaries
CREATE INDEX idx_applications_resume_summary ON applications USING gin(to_tsvector('english', resume_summary));
