
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FileUploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export const uploadSkillsFile = async (
  file: File,
  questionId: string,
  userId: string
): Promise<FileUploadResult | null> => {
  try {
    // Validate file type and size
    if (!validateFile(file, 50)) {
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${questionId}/${Date.now()}.${fileExt}`;

    console.log('Uploading file:', {
      fileName,
      fileType: file.type,
      fileSize: file.size,
      bucket: 'skills-assessments'
    });

    const { data, error } = await supabase.storage
      .from('skills-assessments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        metadata: {
          questionId,
          originalName: file.name,
          size: file.size.toString(),
          type: file.type,
          uploadedBy: userId
        }
      });

    if (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      throw error;
    }

    console.log('Upload successful:', data);

    const { data: { publicUrl } } = supabase.storage
      .from('skills-assessments')
      .getPublicUrl(data.path);

    console.log('Public URL generated:', publicUrl);

    toast.success("File uploaded successfully!");

    return {
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };
  } catch (error) {
    console.error('File upload error:', error);
    toast.error("Failed to upload file. Please try again.");
    return null;
  }
};

export const validateFile = (file: File, maxSizeMB: number = 50): boolean => {
  const maxSize = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSize) {
    toast.error(`File size must be less than ${maxSizeMB}MB`);
    return false;
  }

  // Allow common document and media types
  const allowedTypes = [
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

  if (!allowedTypes.includes(file.type)) {
    toast.error(`File type not supported. Please upload: PDF, DOC, TXT, images, videos, or ZIP files.`);
    return false;
  }
  
  return true;
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};
