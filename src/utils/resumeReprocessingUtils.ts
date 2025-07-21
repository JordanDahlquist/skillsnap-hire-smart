
import { supabase } from "@/integrations/supabase/client";
import { reprocessResumeFile } from "./resumeUploadUtils";
import { toast } from "@/hooks/use-toast";

export interface ReprocessingResult {
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}

export const reprocessApplicationResume = async (applicationId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Re-processing resume for application:', applicationId);
    
    // Get the application data
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('id, resume_file_path, parsed_resume_data')
      .eq('id', applicationId)
      .single();
    
    if (fetchError) {
      throw new Error(`Failed to fetch application: ${fetchError.message}`);
    }
    
    if (!application.resume_file_path) {
      throw new Error('No resume file found for this application');
    }
    
    // Construct the resume URL
    const resumeUrl = application.resume_file_path.startsWith('http') 
      ? application.resume_file_path
      : `https://wrnscwadcetbimpstnpu.supabase.co/storage/v1/object/public/application-files/${application.resume_file_path}`;
    
    // Re-process the resume
    const result = await reprocessResumeFile(resumeUrl);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to re-process resume');
    }
    
    // Update the application with the new parsed data
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        parsed_resume_data: result.parsedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);
    
    if (updateError) {
      throw new Error(`Failed to update application: ${updateError.message}`);
    }
    
    console.log('Successfully re-processed and updated resume for application:', applicationId);
    return { success: true };
  } catch (error) {
    console.error('Resume re-processing failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const batchReprocessResumes = async (jobId?: string): Promise<ReprocessingResult> => {
  const result: ReprocessingResult = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // Query for applications with resume files but no parsed data
    let query = supabase
      .from('applications')
      .select('id, resume_file_path, parsed_resume_data')
      .not('resume_file_path', 'is', null)
      .is('parsed_resume_data', null);
    
    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    
    const { data: applications, error: fetchError } = await query;
    
    if (fetchError) {
      throw new Error(`Failed to fetch applications: ${fetchError.message}`);
    }
    
    if (!applications || applications.length === 0) {
      console.log('No applications found that need resume re-processing');
      return result;
    }
    
    console.log(`Found ${applications.length} applications that need resume re-processing`);
    
    // Process each application
    for (const application of applications) {
      result.processed++;
      
      try {
        const reprocessResult = await reprocessApplicationResume(application.id);
        
        if (reprocessResult.success) {
          result.successful++;
        } else {
          result.failed++;
          result.errors.push(`${application.id}: ${reprocessResult.error}`);
        }
      } catch (error) {
        result.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`${application.id}: ${errorMessage}`);
      }
      
      // Add a small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Batch resume re-processing completed:', result);
    return result;
  } catch (error) {
    console.error('Batch resume re-processing failed:', error);
    result.errors.push(`Batch processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
};

export const showReprocessingResults = (result: ReprocessingResult) => {
  if (result.processed === 0) {
    toast({
      title: "No resumes to reprocess",
      description: "All applications with resumes already have parsed data.",
    });
    return;
  }
  
  const title = result.successful === result.processed 
    ? "Resume reprocessing completed successfully"
    : "Resume reprocessing completed with some errors";
  
  const description = `Processed: ${result.processed}, Successful: ${result.successful}, Failed: ${result.failed}`;
  
  toast({
    title,
    description,
    variant: result.failed > 0 ? "destructive" : "default",
  });
  
  if (result.errors.length > 0) {
    console.error('Resume reprocessing errors:', result.errors);
  }
};
