
-- Create skills-assessments storage bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'skills-assessments',
  'skills-assessments', 
  true,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/zip',
    'application/x-zip-compressed'
  ];

-- Create policies for skills-assessments bucket
CREATE POLICY "Allow public uploads to skills-assessments bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'skills-assessments');

CREATE POLICY "Allow public access to skills-assessments bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'skills-assessments');

CREATE POLICY "Allow users to update their own skills-assessments files" ON storage.objects
FOR UPDATE USING (bucket_id = 'skills-assessments');

CREATE POLICY "Allow users to delete their own skills-assessments files" ON storage.objects
FOR DELETE USING (bucket_id = 'skills-assessments');
