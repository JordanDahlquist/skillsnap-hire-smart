
-- Create the application-files storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-files',
  'application-files',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'video/webm', 'video/mp4', 'video/quicktime', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public uploads to application-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to application-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their files" ON storage.objects;

-- Create storage policies for the application-files bucket
CREATE POLICY "Allow public uploads to application-files bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'application-files');

CREATE POLICY "Allow public access to application-files bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'application-files');

CREATE POLICY "Allow users to update their files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'application-files');

CREATE POLICY "Allow users to delete their files"
ON storage.objects FOR DELETE
USING (bucket_id = 'application-files');
