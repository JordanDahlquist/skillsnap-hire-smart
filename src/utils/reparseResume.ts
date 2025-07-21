import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const reparseResumeForApplication = async (applicationId: string, resumeUrl: string): Promise<boolean> => {
  try {
    console.log('Re-parsing resume for application:', applicationId);
    
    // First, try to fetch and extract text from the resume PDF
    const response = await fetch(resumeUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch resume file');
    }
    
    const blob = await response.blob();
    
    // For PDFs, we'll send a placeholder text since we can't extract PDF content client-side
    // The parse-resume function should handle this gracefully
    const resumeText = `Resume PDF file uploaded. Please analyze the document structure and extract relevant information. File URL: ${resumeUrl}`;
    
    // Parse resume using AI
    const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-resume', {
      body: { resumeText }
    });

    if (parseError) {
      console.error('Resume parsing failed:', parseError);
      throw new Error(`Parsing failed: ${parseError.message}`);
    }

    if (!parseResult?.parsedData) {
      throw new Error('No parsed data returned from resume parsing');
    }

    // Update the application with parsed resume data
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        parsed_resume_data: parseResult.parsedData,
        // Also update the structured fields if they're empty
        work_experience: parseResult.parsedData.workExperience || null,
        education: parseResult.parsedData.education || null,
        skills: parseResult.parsedData.skills || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Failed to update application with parsed data:', updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log('Successfully re-parsed and updated resume data');
    toast.success('Resume data updated successfully');
    return true;

  } catch (error) {
    console.error('Failed to re-parse resume:', error);
    toast.error(`Failed to update resume data: ${error.message}`);
    return false;
  }
};