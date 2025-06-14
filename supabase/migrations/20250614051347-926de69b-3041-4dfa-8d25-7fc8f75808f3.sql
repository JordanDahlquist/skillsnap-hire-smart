
-- Add transcript fields to applications table
ALTER TABLE applications 
ADD COLUMN skills_video_transcripts jsonb DEFAULT '[]'::jsonb,
ADD COLUMN interview_video_transcripts jsonb DEFAULT '[]'::jsonb,
ADD COLUMN transcript_processing_status text DEFAULT 'pending',
ADD COLUMN transcript_last_processed_at timestamp with time zone;

-- Add comments for clarity
COMMENT ON COLUMN applications.skills_video_transcripts IS 'Array of transcripts from skills assessment videos with question mapping';
COMMENT ON COLUMN applications.interview_video_transcripts IS 'Array of transcripts from interview videos with question mapping';
COMMENT ON COLUMN applications.transcript_processing_status IS 'Status of transcript processing: pending, processing, completed, failed';
COMMENT ON COLUMN applications.transcript_last_processed_at IS 'Timestamp of last transcript processing attempt';
