
import { supabase } from "@/integrations/supabase/client";
import { Application, Job } from "@/types";
import { DASHBOARD_ACTION_CONSTANTS } from "@/constants/dashboardActions";

interface StreamlinedAnalysisData {
  // Basic Info
  name: string;
  email: string;
  phone?: string;
  location?: string;
  
  // Application Content
  portfolio?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  cover_letter?: string;
  experience?: string;
  available_start_date?: string;
  
  // Skills Assessment
  answer_1?: string;
  answer_2?: string;
  answer_3?: string;
  skills_test_responses?: any[];
  
  // Video Content
  interview_video_url?: string;
  interview_video_responses?: any[];
  has_video_content?: boolean;
  video_response_count?: number;
  
  // Video Transcripts (streamlined)
  skills_video_transcripts?: any[];
  interview_video_transcripts?: any[];
  has_video_transcripts?: boolean;
  
  // Structured Data (prioritized from resume)
  skills?: string[];
  work_experience?: any[];
  education?: any[];
  
  // Resume Data (from PDF parsing) - PRIORITIZED
  resume_file_path?: string;
  professional_summary?: string;
  total_experience?: string;
  has_parsed_resume?: boolean;
  resume_parsing_status?: string;
}

interface StreamlinedJobData {
  title: string;
  description: string;
  role_type: string;
  experience_level: string;
  required_skills: string;
  employment_type: string;
  location_type?: string;
  budget?: string;
  duration?: string;
  company_name?: string;
}

export class AIAnalysisService {
  static async analyzeApplication(application: Application, job: Job): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Starting AI analysis for application:', application.id);
      
      // Process video content
      const skillsResponses = Array.isArray(application.skills_test_responses) 
        ? application.skills_test_responses 
        : [];
      const interviewResponses = Array.isArray(application.interview_video_responses) 
        ? application.interview_video_responses 
        : [];
      
      const hasVideoContent = !!(
        application.interview_video_url || 
        skillsResponses.some((r: any) => r?.video_url || r?.videoUrl || r?.answer_video_url) ||
        interviewResponses.length > 0
      );

      const videoResponseCount = skillsResponses.length + interviewResponses.length + 
        (application.interview_video_url ? 1 : 0);

      // Process video transcripts (limit size)
      const skillsTranscripts = Array.isArray(application.skills_video_transcripts) 
        ? application.skills_video_transcripts.slice(0, 3)
        : [];
      const interviewTranscripts = Array.isArray(application.interview_video_transcripts) 
        ? application.interview_video_transcripts.slice(0, 3)
        : [];
      
      const hasVideoTranscripts = skillsTranscripts.length > 0 || interviewTranscripts.length > 0;

      // Process resume data (PRIORITIZED - this is the key fix)
      let resumeData = null;
      let resumeParsingStatus = 'none';
      
      if (application.resume_file_path) {
        if (application.parsed_resume_data) {
          try {
            resumeData = typeof application.parsed_resume_data === 'string' 
              ? JSON.parse(application.parsed_resume_data) 
              : application.parsed_resume_data;
            resumeParsingStatus = 'success';
            console.log('Successfully loaded parsed resume data for:', application.name);
          } catch (e) {
            console.warn('Failed to parse resume data for:', application.name, e);
            resumeParsingStatus = 'failed';
          }
        } else {
          resumeParsingStatus = 'missing';
          console.warn('Resume file exists but no parsed data for:', application.name);
        }
      }

      // Process structured data (PRIORITIZE parsed resume data over manual input)
      const processedSkills = (() => {
        // First prioritize parsed resume skills
        if (resumeData?.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
          console.log('Using resume skills for:', application.name);
          return resumeData.skills.slice(0, 20);
        }
        // Fall back to manual application skills
        if (Array.isArray(application.skills) && application.skills.length > 0) {
          console.log('Using manual skills for:', application.name);
          return application.skills.slice(0, 15).map((skill: any) => 
            typeof skill === 'string' ? skill : skill?.name || skill?.skill || 'Unknown skill'
          ).filter(Boolean);
        }
        return [];
      })();

      const processedWorkExperience = (() => {
        // First prioritize parsed resume work experience
        if (resumeData?.workExperience && Array.isArray(resumeData.workExperience) && resumeData.workExperience.length > 0) {
          console.log('Using resume work experience for:', application.name);
          return resumeData.workExperience.slice(0, 8).map((exp: any) => ({
            company: exp?.company || 'Unknown company',
            position: exp?.position || 'Unknown position',
            duration: exp?.startDate && exp?.endDate 
              ? `${exp.startDate} - ${exp.endDate}` 
              : exp?.duration || 'Duration not specified',
            description: exp?.description?.substring(0, 400) || 'No description provided'
          }));
        }
        // Fall back to manual application work experience
        if (Array.isArray(application.work_experience) && application.work_experience.length > 0) {
          console.log('Using manual work experience for:', application.name);
          return application.work_experience.slice(0, 6).map((exp: any) => ({
            company: exp?.company || exp?.employer || 'Unknown company',
            position: exp?.title || exp?.position || 'Unknown position',
            duration: exp?.duration || `${exp?.start_date || 'Unknown'} - ${exp?.end_date || 'Present'}`,
            description: exp?.description?.substring(0, 300) || 'No description provided'
          })).filter(exp => exp.company !== 'Unknown company' || exp.position !== 'Unknown position');
        }
        return [];
      })();

      const processedEducation = (() => {
        // First prioritize parsed resume education
        if (resumeData?.education && Array.isArray(resumeData.education) && resumeData.education.length > 0) {
          console.log('Using resume education for:', application.name);
          return resumeData.education.slice(0, 5).map((edu: any) => ({
            institution: edu?.institution || 'Unknown institution',
            degree: edu?.degree || 'Unknown degree',
            field: edu?.field || 'Unknown field',
            year: edu?.graduationDate || edu?.year || 'Unknown year',
            gpa: edu?.gpa || 'Not specified'
          }));
        }
        // Fall back to manual application education
        if (Array.isArray(application.education) && application.education.length > 0) {
          console.log('Using manual education for:', application.name);
          return application.education.slice(0, 4).map((edu: any) => ({
            institution: edu?.institution || edu?.school || 'Unknown institution',
            degree: edu?.degree || 'Unknown degree',
            field: edu?.field || edu?.major || 'Unknown field',
            year: edu?.year || edu?.graduation_year || 'Unknown year'
          })).filter(edu => edu.institution !== 'Unknown institution' || edu.degree !== 'Unknown degree');
        }
        return [];
      })();

      // Extract professional summary from parsed resume (PRIORITIZED)
      const professionalSummary = resumeData?.summary || '';
      const totalExperience = resumeData?.totalExperience || '';

      // Log what data we're working with
      console.log('Data summary for', application.name, {
        hasResumeFile: !!application.resume_file_path,
        hasParsedData: !!resumeData,
        skillsCount: processedSkills.length,
        experienceCount: processedWorkExperience.length,
        educationCount: processedEducation.length,
        resumeParsingStatus
      });

      // Create streamlined analysis data
      const analysisData: StreamlinedAnalysisData = {
        // Basic Info
        name: application.name,
        email: application.email,
        phone: application.phone || undefined,
        location: application.location || undefined,
        
        // Application Content (truncate long text)
        portfolio: application.portfolio || undefined,
        portfolio_url: application.portfolio_url || undefined,
        linkedin_url: application.linkedin_url || undefined,
        github_url: application.github_url || undefined,
        cover_letter: application.cover_letter?.substring(0, 1000) || undefined,
        experience: application.experience || undefined,
        available_start_date: application.available_start_date || undefined,
        
        // Skills Assessment (truncate responses)
        answer_1: application.answer_1?.substring(0, 500) || undefined,
        answer_2: application.answer_2?.substring(0, 500) || undefined,
        answer_3: application.answer_3?.substring(0, 500) || undefined,
        skills_test_responses: skillsResponses.length > 0 ? skillsResponses.slice(0, 5) : undefined,
        
        // Video Content
        interview_video_url: application.interview_video_url || undefined,
        interview_video_responses: interviewResponses.length > 0 ? interviewResponses.slice(0, 3) : undefined,
        has_video_content: hasVideoContent,
        video_response_count: videoResponseCount,
        
        // Video Transcripts (limited)
        skills_video_transcripts: skillsTranscripts.length > 0 ? skillsTranscripts : undefined,
        interview_video_transcripts: interviewTranscripts.length > 0 ? interviewTranscripts : undefined,
        has_video_transcripts: hasVideoTranscripts,
        
        // Structured Data (PRIORITIZED from resume)
        skills: processedSkills.length > 0 ? processedSkills : undefined,
        work_experience: processedWorkExperience.length > 0 ? processedWorkExperience : undefined,
        education: processedEducation.length > 0 ? processedEducation : undefined,
        
        // Resume Data (PRIORITIZED)
        resume_file_path: application.resume_file_path || undefined,
        professional_summary: professionalSummary || undefined,
        total_experience: totalExperience || undefined,
        has_parsed_resume: !!resumeData,
        resume_parsing_status: resumeParsingStatus,
      };

      const jobData: StreamlinedJobData = {
        title: job.title,
        description: job.description?.substring(0, 1500) || '', // Truncate long descriptions
        role_type: job.role_type,
        experience_level: job.experience_level,
        required_skills: job.required_skills?.substring(0, 500) || '',
        employment_type: job.employment_type,
        location_type: job.location_type || undefined,
        budget: job.budget || undefined,
        duration: job.duration || undefined,
        company_name: job.company_name || undefined,
      };

      console.log('Calling analyze-application function for:', application.name);

      const { data, error } = await supabase.functions.invoke('analyze-application', {
        body: {
          applicationData: analysisData,
          jobData
        }
      });

      if (error) {
        console.error('AI analysis error for application:', application.id, error);
        return { success: false, error: error.message };
      }

      if (data?.rating && data?.summary) {
        const { error: updateError } = await supabase
          .from('applications')
          .update({
            ai_rating: data.rating,
            ai_summary: data.summary,
            updated_at: new Date().toISOString()
          })
          .eq('id', application.id);

        if (updateError) {
          console.error('Error updating application:', application.id, updateError);
          return { success: false, error: updateError.message };
        }

        console.log('Analysis completed for application:', application.id, 
          'Rating:', data.rating, 'Summary length:', data.summary.length);
        return { success: true };
      }

      return { success: false, error: 'No rating or summary returned from analysis' };
    } catch (error) {
      console.error('Error in analysis for application:', application.id, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async processBatch(applications: Application[], job: Job): Promise<{ successCount: number; errorCount: number }> {
    const BATCH_SIZE = 2; // Keep batch size small for stability
    const BATCH_DELAY = 2000; // 2 second delay between batches
    let successCount = 0;
    let errorCount = 0;

    console.log(`Starting batch processing of ${applications.length} applications with batch size ${BATCH_SIZE}`);

    for (let i = 0; i < applications.length; i += BATCH_SIZE) {
      const batch = applications.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(applications.length / BATCH_SIZE)}`);
      
      const results = await Promise.allSettled(
        batch.map(application => this.analyzeApplication(application, job))
      );

      results.forEach((result, index) => {
        const applicationName = batch[index].name;
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
          console.log(`✓ Successfully analyzed: ${applicationName}`);
        } else {
          errorCount++;
          const error = result.status === 'fulfilled' ? result.value.error : result.reason;
          console.error(`✗ Failed to analyze: ${applicationName}`, error);
        }
      });

      // Delay between batches to avoid overwhelming the API
      if (i + BATCH_SIZE < applications.length) {
        console.log(`Waiting ${BATCH_DELAY}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    console.log(`Batch processing completed. Success: ${successCount}, Errors: ${errorCount}`);
    return { successCount, errorCount };
  }
}
