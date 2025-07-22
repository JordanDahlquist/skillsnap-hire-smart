
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ParsedResumeData {
  [key: string]: any;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
}

// Upload file to Supabase Storage
export const uploadResumeFile = async (file: File): Promise<{ url: string }> => {
  try {
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('application-files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('application-files')
      .getPublicUrl(fileName);

    console.log('File uploaded to:', publicUrl);

    return { url: publicUrl };

  } catch (error) {
    console.error('Resume upload failed:', error);
    throw error;
  }
};

export const constructResumeUrl = (filePath: string): string => {
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  if (filePath.startsWith('blob:')) {
    return filePath;
  }
  
  if (!filePath.includes('/')) {
    return `https://wrnscwadcetbimpstnpu.supabase.co/storage/v1/object/public/application-files/${filePath}`;
  }
  
  return `https://wrnscwadcetbimpstnpu.supabase.co/storage/v1/object/public/application-files/${filePath}`;
};
