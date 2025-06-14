
-- Create the application-files storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-files',
  'application-files',
  true,
  1073741824, -- 1GB limit
  ARRAY[
    'video/webm', 
    'video/mp4', 
    'video/quicktime', 
    'application/pdf', 
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg', 
    'image/png'
  ]
);

-- Create storage policies for the application-files bucket
CREATE POLICY "Allow public uploads to application-files bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'application-files');

CREATE POLICY "Allow public access to application-files bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'application-files');

CREATE POLICY "Allow authenticated users to update their files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'application-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow authenticated users to delete their files"
ON storage.objects FOR DELETE
USING (bucket_id = 'application-files' AND auth.uid()::text = (storage.foldername(name))[1]);
