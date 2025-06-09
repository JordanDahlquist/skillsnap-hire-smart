
-- Add interview questions support to jobs table
ALTER TABLE jobs ADD COLUMN generated_interview_questions text;
ALTER TABLE jobs ADD COLUMN interview_video_max_length integer DEFAULT 5;

-- Add interview video URL to applications table
ALTER TABLE applications ADD COLUMN interview_video_url text;
