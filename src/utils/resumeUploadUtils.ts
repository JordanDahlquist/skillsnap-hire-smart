
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
    try {
      // Use the new PDF extraction edge function
      const formData = new FormData();
      formData.append('pdf', file);
      
      const { data, error } = await supabase.functions.invoke('extract-pdf-text', {
        body: formData
      });
      
      if (error) {
        console.error('PDF extraction error:', error);
        throw new Error(`PDF extraction failed: ${error.message}`);
      }
      
      if (!data?.success || !data?.text) {
        throw new Error('Failed to extract text from PDF');
      }
      
      console.log(`Successfully extracted ${data.text.length} characters from PDF`);
      return data.text;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to extract text from PDF. Please ensure the PDF contains readable text.');
    }
  } else if (fileType === 'text/plain') {
    // For text files, read directly
    return await file.text();
  } else if (fileType.includes('document')) {
    // For Word documents, we'll need mammoth or similar
    // For now, return a basic extraction notice
    return `Word document: ${file.name} (${file.size} bytes) - Word document parsing not yet implemented`;
  }
  
  return `Unsupported file type: ${fileType}`;
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
    console.log('Extracting text from file...');
    const extractedText = await extractTextFromFile(file);
    console.log('Extracted text length:', extractedText.length);

    if (!extractedText || extractedText.length < 10) {
      console.warn('No meaningful text extracted from file');
      return { url: publicUrl };
    }

    try {
      // Parse resume using AI with real extracted text
      console.log('Sending text to parse-resume function...');
      const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-resume', {
        body: { resumeText: extractedText }
      });

      if (parseError) {
        console.error('Parse error:', parseError);
        throw parseError;
      }

      if (parseResult?.parsedData) {
        console.log('Successfully parsed resume data');
        return {
          url: publicUrl,
          parsedData: parseResult.parsedData
        };
      } else {
        console.warn('No parsed data returned from parse-resume function');
        return { url: publicUrl };
      }
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

// Function to re-process existing resumes that failed to parse
export const reprocessResumeFile = async (resumeUrl: string): Promise<{ success: boolean; parsedData?: ParsedResumeData; error?: string }> => {
  try {
    console.log('Re-processing resume from URL:', resumeUrl);
    
    // Fetch the file from the URL
    const response = await fetch(resumeUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch resume: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const file = new File([blob], 'resume.pdf', { type: 'application/pdf' });
    
    // Extract text from the file
    const extractedText = await extractTextFromFile(file);
    
    if (!extractedText || extractedText.length < 10) {
      throw new Error('No meaningful text could be extracted from the resume');
    }
    
    // Parse the extracted text
    const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-resume', {
      body: { resumeText: extractedText }
    });
    
    if (parseError) {
      throw parseError;
    }
    
    if (parseResult?.parsedData) {
      return {
        success: true,
        parsedData: parseResult.parsedData
      };
    } else {
      throw new Error('No parsed data returned from parse-resume function');
    }
  } catch (error) {
    console.error('Resume re-processing failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
