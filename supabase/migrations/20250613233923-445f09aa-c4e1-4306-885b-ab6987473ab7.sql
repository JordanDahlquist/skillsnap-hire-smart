
-- Create storage bucket for skills assessment video uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'skills-assessments', 
  'skills-assessments', 
  false, 
  1073741824, -- 1GB in bytes
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi']
);

-- Create RLS policies for skills assessment uploads
CREATE POLICY "Users can upload their own skills assessment videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'skills-assessments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own skills assessment videos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'skills-assessments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Recruiters can view skills assessment videos for their jobs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'skills-assessments' AND 
  EXISTS (
    SELECT 1 FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.user_id = auth.uid()
    AND a.id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Users can delete their own skills assessment videos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'skills-assessments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
