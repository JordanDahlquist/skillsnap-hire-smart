
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

    console.log('File uploaded to:', publicUrl);

    // Only attempt parsing for PDF files
    if (file.type === 'application/pdf') {
      try {
        console.log('Analyzing PDF resume with visual AI...');
        
        // Use the new visual analysis function
        const { data: parseResult, error: parseError } = await supabase.functions.invoke('analyze-resume-visual', {
          body: { resumeUrl: publicUrl }
        });

        if (parseError) {
          console.error('Resume visual analysis failed:', parseError);
          throw new Error(`Resume analysis failed: ${parseError.message}`);
        }

        if (parseResult?.parsedData) {
          console.log('Successfully parsed resume data:', parseResult.parsedData);
          return {
            url: publicUrl,
            parsedData: parseResult.parsedData
          };
        } else {
          console.warn('No parsed data returned from analysis');
          return { url: publicUrl };
        }
      } catch (parseError) {
        console.error('Resume parsing failed:', parseError);
        throw parseError; // Re-throw to let the caller handle it
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

// Function to re-process existing resumes with visual analysis
export const reprocessResumeWithVisualAnalysis = async (resumeUrl: string): Promise<ParsedResumeData | null> => {
  try {
    console.log('Re-processing resume with visual analysis:', resumeUrl);
    
    const { data: parseResult, error: parseError } = await supabase.functions.invoke('analyze-resume-visual', {
      body: { resumeUrl }
    });

    if (parseError) {
      console.error('Resume re-processing failed:', parseError);
      throw new Error(`Resume analysis failed: ${parseError.message}`);
    }

    if (parseResult?.parsedData) {
      console.log('Successfully re-processed resume:', parseResult.parsedData);
      return parseResult.parsedData;
    }

    console.warn('No parsed data returned from re-processing');
    return null;
  } catch (error) {
    console.error('Error re-processing resume:', error);
    throw error;
  }
};
