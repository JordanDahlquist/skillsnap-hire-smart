
import { supabase } from "@/integrations/supabase/client";

interface TemplateData {
  position?: string;
  company?: string;
  candidateName?: string;
  [key: string]: string | undefined;
}

export const processEmailSubject = async (
  subject: string,
  applicationId?: string,
  jobId?: string,
  additionalData?: TemplateData
): Promise<string> => {
  let processedSubject = subject;
  const templateData: TemplateData = { ...additionalData };

  // Fetch job data if jobId is provided
  if (jobId) {
    const { data: job } = await supabase
      .from('jobs')
      .select('title, company_name')
      .eq('id', jobId)
      .single();
    
    if (job) {
      templateData.position = job.title;
      templateData.company = job.company_name;
    }
  }

  // Fetch application data if applicationId is provided
  if (applicationId) {
    const { data: application } = await supabase
      .from('applications')
      .select('name, job_id')
      .eq('id', applicationId)
      .single();
    
    if (application) {
      templateData.candidateName = application.name;
      
      // If we don't have job data yet, fetch it using the application's job_id
      if (!jobId && application.job_id) {
        const { data: job } = await supabase
          .from('jobs')
          .select('title, company_name')
          .eq('id', application.job_id)
          .single();
        
        if (job) {
          templateData.position = job.title;
          templateData.company = job.company_name;
        }
      }
    }
  }

  // Replace template variables
  processedSubject = processedSubject.replace(/\{position\}/g, templateData.position || 'Position');
  processedSubject = processedSubject.replace(/\{company\}/g, templateData.company || 'Company');
  processedSubject = processedSubject.replace(/\{candidateName\}/g, templateData.candidateName || 'Candidate');

  return processedSubject;
};

export const hasTemplateVariables = (text: string): boolean => {
  return /\{[^}]+\}/.test(text);
};
