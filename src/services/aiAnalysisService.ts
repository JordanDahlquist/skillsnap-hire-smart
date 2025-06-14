import { supabase } from "@/integrations/supabase/client";
import { Application, Job } from "@/types";
import { DASHBOARD_ACTION_CONSTANTS } from "@/constants/dashboardActions";

interface ComprehensiveAnalysisData {
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
  
  // Structured Data
  skills?: any[];
  work_experience?: any[];
  education?: any[];
  parsed_resume_data?: any;
  
  // Resume
  resume_file_path?: string;
  
  // AI Previous Analysis
  existing_ai_summary?: string;
  existing_ai_rating?: number;
}

interface ComprehensiveJobData {
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
      console.log('Comprehensive AI analysis for application:', application.id);
      
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

      // Process structured data
      const processedSkills = Array.isArray(application.skills) 
        ? application.skills.map((skill: any) => 
            typeof skill === 'string' ? skill : skill?.name || skill?.skill || 'Unknown skill'
          ).filter(Boolean)
        : [];

      const processedWorkExperience = Array.isArray(application.work_experience) 
        ? application.work_experience.map((exp: any) => ({
            company: exp?.company || exp?.employer || 'Unknown company',
            position: exp?.title || exp?.position || 'Unknown position',
            duration: exp?.duration || `${exp?.start_date || 'Unknown'} - ${exp?.end_date || 'Present'}`,
            description: exp?.description || 'No description provided'
          })).filter(exp => exp.company !== 'Unknown company' || exp.position !== 'Unknown position')
        : [];

      const processedEducation = Array.isArray(application.education) 
        ? application.education.map((edu: any) => ({
            institution: edu?.institution || edu?.school || 'Unknown institution',
            degree: edu?.degree || 'Unknown degree',
            field: edu?.field || edu?.major || 'Unknown field',
            year: edu?.year || edu?.graduation_year || 'Unknown year'
          })).filter(edu => edu.institution !== 'Unknown institution' || edu.degree !== 'Unknown degree')
        : [];

      const analysisData: ComprehensiveAnalysisData = {
        // Basic Info
        name: application.name,
        email: application.email,
        phone: application.phone || undefined,
        location: application.location || undefined,
        
        // Application Content
        portfolio: application.portfolio || undefined,
        portfolio_url: application.portfolio_url || undefined,
        linkedin_url: application.linkedin_url || undefined,
        github_url: application.github_url || undefined,
        cover_letter: application.cover_letter || undefined,
        experience: application.experience || undefined,
        available_start_date: application.available_start_date || undefined,
        
        // Skills Assessment
        answer_1: application.answer_1 || undefined,
        answer_2: application.answer_2 || undefined,
        answer_3: application.answer_3 || undefined,
        skills_test_responses: skillsResponses.length > 0 ? skillsResponses : undefined,
        
        // Video Content
        interview_video_url: application.interview_video_url || undefined,
        interview_video_responses: interviewResponses.length > 0 ? interviewResponses : undefined,
        has_video_content: hasVideoContent,
        video_response_count: videoResponseCount,
        
        // Structured Data
        skills: processedSkills.length > 0 ? processedSkills : undefined,
        work_experience: processedWorkExperience.length > 0 ? processedWorkExperience : undefined,
        education: processedEducation.length > 0 ? processedEducation : undefined,
        parsed_resume_data: application.parsed_resume_data || undefined,
        
        // Resume
        resume_file_path: application.resume_file_path || undefined,
        
        // AI Previous Analysis
        existing_ai_summary: application.ai_summary || undefined,
        existing_ai_rating: application.ai_rating || undefined,
      };

      const jobData: ComprehensiveJobData = {
        title: job.title,
        description: job.description,
        role_type: job.role_type,
        experience_level: job.experience_level,
        required_skills: job.required_skills,
        employment_type: job.employment_type,
        location_type: job.location_type || undefined,
        budget: job.budget || undefined,
        duration: job.duration || undefined,
        company_name: job.company_name || undefined,
      };

      const { data, error } = await supabase.functions.invoke('analyze-application', {
        body: {
          applicationData: analysisData,
          jobData
        }
      });

      if (error) {
        console.error('Comprehensive AI analysis error for application:', application.id, error);
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

        console.log('Comprehensive analysis completed for application:', application.id, 
          'Rating:', data.rating, 'Summary length:', data.summary.length);
        return { success: true };
      }

      return { success: false, error: 'No rating or summary returned from comprehensive analysis' };
    } catch (error) {
      console.error('Error in comprehensive analysis for application:', application.id, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async processBatch(applications: Application[], job: Job): Promise<{ successCount: number; errorCount: number }> {
    const { BATCH_SIZE, BATCH_DELAY } = DASHBOARD_ACTION_CONSTANTS.AI_REFRESH;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < applications.length; i += BATCH_SIZE) {
      const batch = applications.slice(i, i + BATCH_SIZE);
      
      const results = await Promise.allSettled(
        batch.map(application => this.analyzeApplication(application, job))
      );

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
        } else {
          errorCount++;
        }
      });

      // Small delay between batches
      if (i + BATCH_SIZE < applications.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    return { successCount, errorCount };
  }
}
