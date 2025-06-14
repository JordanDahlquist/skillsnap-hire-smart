
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

    // Extract text from file for parsing (simplified for demo)
    const simulatedText = `
      John Doe
      Software Engineer
      john.doe@email.com
      (555) 123-4567
      San Francisco, CA
      
      EXPERIENCE
      Senior Software Engineer at TechCorp (2020-Present)
      - Led development of web applications using React and Node.js
      - Managed a team of 5 developers
      
      Software Engineer at StartupXYZ (2018-2020)
      - Built scalable APIs and microservices
      - Worked with AWS and Docker
      
      EDUCATION
      Bachelor of Science in Computer Science
      University of California, Berkeley (2018)
      
      SKILLS
      JavaScript, React, Node.js, Python, AWS, Docker, Git
    `;

    try {
      // Parse resume using AI
      const { data: parseResult } = await supabase.functions.invoke('parse-resume', {
        body: { resumeText: simulatedText }
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
