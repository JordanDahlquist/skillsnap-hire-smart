
-- Create email-attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'email-attachments',
  'email-attachments',
  false, -- Keep private for security
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for email attachments
CREATE POLICY "Users can upload their own attachments" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'email-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own attachments" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'email-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own attachments" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'email-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Service role can access all attachments (for email sending)
CREATE POLICY "Service role can access all attachments" 
ON storage.objects FOR ALL 
USING (bucket_id = 'email-attachments')
WITH CHECK (bucket_id = 'email-attachments');
