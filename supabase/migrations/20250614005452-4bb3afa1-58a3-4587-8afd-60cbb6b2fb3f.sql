
-- Add a new column to store interview video responses separately from skills test responses
ALTER TABLE applications 
ADD COLUMN interview_video_responses jsonb DEFAULT '[]'::jsonb;

-- Update the column comment for clarity
COMMENT ON COLUMN applications.interview_video_responses IS 'Array of interview video responses with question, videoUrl, videoFileName, etc.';
