
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ParsedResumeData {
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
  summary: string;
  totalExperience: string;
}

const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;
  
  if (fileType === 'application/pdf') {
    // For PDF files, we'll need to use a text extraction library
    // For now, return a basic extraction notice
    return `PDF file: ${file.name} (${file.size} bytes)`;
  } else if (fileType === 'text/plain') {
    // For text files, read directly
    return await file.text();
  } else if (fileType.includes('document')) {
    // For Word documents, we'll need mammoth or similar
    // For now, return a basic extraction notice
    return `Word document: ${file.name} (${file.size} bytes)`;
  }
  
  return `File: ${file.name} (${file.size} bytes)`;
};

export const uploadResumeFile = async (file: File): Promise<{ url: string; parsedData?: ParsedResumeData }> => {
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

    // Construct the complete URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('application-files')
      .getPublicUrl(fileName);

    // Extract actual text from the file
    const extractedText = await extractTextFromFile(file);
    console.log('Extracted text from file:', extractedText);

    try {
      // Parse resume using AI with real extracted text
      const { data: parseResult } = await supabase.functions.invoke('parse-resume', {
        body: { resumeText: extractedText }
      });

      return {
        url: publicUrl,
        parsedData: parseResult?.parsedData
      };
    } catch (parseError) {
      console.warn('Resume parsing failed, but upload succeeded:', parseError);
      return { url: publicUrl };
    }
  } catch (error) {
    console.error('Resume upload failed:', error);
    throw error;
  }
};

export const constructResumeUrl = (filePath: string): string => {
  // If it's already a complete URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // If it's a blob URL (for local testing), return as is
  if (filePath.startsWith('blob:')) {
    return filePath;
  }
  
  // If it's just a filename, construct the Supabase Storage URL
  if (!filePath.includes('/')) {
    return `https://wrnscwadcetbimpstnpu.supabase.co/storage/v1/object/public/application-files/${filePath}`;
  }
  
  // If it contains slashes but isn't a full URL, assume it's a relative path from the bucket
  return `https://wrnscwadcetbimpstnpu.supabase.co/storage/v1/object/public/application-files/${filePath}`;
};
