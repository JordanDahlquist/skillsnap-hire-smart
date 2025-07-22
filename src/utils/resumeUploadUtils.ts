
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
}

export const uploadResumeFile = async (file: File): Promise<{ url: string; parsedData?: ParsedResumeData; aiRating?: number; summary?: string }> => {
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

    // Only attempt parsing for PDF files
    if (file.type === 'application/pdf') {
      try {
        console.log('Parsing PDF resume with Eden AI...');
        
        const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-resume-eden', {
          body: { resumeUrl: publicUrl }
        });

        if (parseError) {
          throw new Error(`Resume analysis failed: ${parseError.message}`);
        }

        return {
          url: publicUrl,
          parsedData: parseResult.parsedData,
          aiRating: parseResult.aiRating,
          summary: parseResult.summary
        };
      } catch (parseError) {
        console.error('Resume parsing failed:', parseError);
        throw parseError;
      }
    }

    // For non-PDF files, just return the URL
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

// Function to re-process existing resumes
export const reprocessResumeWithEdenAI = async (resumeUrl: string): Promise<{ 
  parsedData: ParsedResumeData; 
  aiRating: number; 
  summary: string; 
}> => {
  try {
    console.log('Re-processing resume with Eden AI:', resumeUrl);
    
    const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-resume-eden', {
      body: { resumeUrl }
    });

    if (parseError) {
      throw new Error(`Resume analysis failed: ${parseError.message}`);
    }

    if (!parseResult?.parsedData) {
      throw new Error('No parsed data returned from processing');
    }

    return {
      parsedData: parseResult.parsedData,
      aiRating: parseResult.aiRating,
      summary: parseResult.summary
    };
  } catch (error) {
    console.error('Error re-processing resume:', error);
    throw error;
  }
};
