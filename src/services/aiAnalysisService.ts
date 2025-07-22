
import { supabase } from "@/integrations/supabase/client";
import { Application, Job } from "@/types";
import { DASHBOARD_ACTION_CONSTANTS } from "@/constants/dashboardActions";
import { reprocessResumeWithEdenAI, updateApplicationWithResumeData } from "@/utils/resumeUploadUtils";

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
  
  // Structured Data (simplified)
  skills?: string[];
  work_experience?: any[];
  education?: any[];
  
  // Resume Data (from PDF parsing)
  resume_file_path?: string;
  professional_summary?: string;
  total_experience?: string;
  has_parsed_resume?: boolean;
  resume_summary?: string; // AI-generated comprehensive summary
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
  // NEW: Main method that handles resume parsing before AI analysis
  static async processWithResumeParsing(applications: Application[], job: Job): Promise<{ successCount: number; errorCount: number; parsedCount: number }> {
    console.log(`Starting processWithResumeParsing for ${applications.length} applications`);
    
    // Step 1: Identify applications that need resume parsing
    const applicationsNeedingParsing = applications.filter(app => 
      app.resume_file_path && !app.parsed_resume_data
    );
    
    let parsedCount = 0;
    
    console.log(`Found ${applicationsNeedingParsing.length} applications needing resume parsing`);
    
    // Step 2: Parse resumes first if needed
    if (applicationsNeedingParsing.length > 0) {
      parsedCount = await this.parseUnprocessedResumes(applicationsNeedingParsing);
      console.log(`Successfully parsed ${parsedCount} resumes`);
    }
    
    // Step 3: Run AI analysis on all applications (now with parsed data where available)
    const { successCount, errorCount } = await this.processBatch(applications, job);
    
    return { successCount, errorCount, parsedCount };
  }

  // NEW: Parse resumes for applications that haven't been processed yet
  private static async parseUnprocessedResumes(applications: Application[]): Promise<number> {
    const PARSE_BATCH_SIZE = 2;
    const PARSE_DELAY = 3000; // 3 seconds between parsing batches
    let successCount = 0;

    console.log(`Parsing ${applications.length} unprocessed resumes in batches of ${PARSE_BATCH_SIZE}`);

    for (let i = 0; i < applications.length; i += PARSE_BATCH_SIZE) {
      const batch = applications.slice(i, i + PARSE_BATCH_SIZE);
      console.log(`Parsing batch ${Math.floor(i / PARSE_BATCH_SIZE) + 1}/${Math.ceil(applications.length / PARSE_BATCH_SIZE)}`);
      
      const results = await Promise.allSettled(
        batch.map(application => this.parseApplicationResume(application))
      );

      results.forEach((result, index) => {
        const applicationName = batch[index].name;
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
          console.log(`✓ Successfully parsed resume for: ${applicationName}`);
        } else {
          const error = result.status === 'fulfilled' ? result.value.error : result.reason;
          console.error(`✗ Failed to parse resume for: ${applicationName}`, error);
        }
      });

      // Delay between batches to avoid overwhelming the API
      if (i + PARSE_BATCH_SIZE < applications.length) {
        console.log(`Waiting ${PARSE_DELAY}ms before next parsing batch...`);
        await new Promise(resolve => setTimeout(resolve, PARSE_DELAY));
      }
    }

    return successCount;
  }

  // NEW: Parse individual application resume
  private static async parseApplicationResume(application: Application): Promise<{ success: boolean; error?: string }> {
    try {
      if (!application.resume_file_path) {
        return { success: false, error: 'No resume file path' };
      }

      console.log(`Parsing resume for application: ${application.id}, Resume: ${application.resume_file_path}`);
      
      const { parsedData, aiRating, summary } = await reprocessResumeWithEdenAI(application.resume_file_path);
      
      if (!parsedData) {
        return { success: false, error: 'No parsed data returned' };
      }

      // Save parsed data to database
      await updateApplicationWithResumeData(application.id, parsedData, aiRating, summary);
      
      console.log(`Successfully parsed and saved resume data for: ${application.name}`);
      return { success: true };

    } catch (error) {
      console.error(`Error parsing resume for application: ${application.id}`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

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

      // CRITICAL FIX: Extract and properly format resume data
      let resumeData = null;
      if (application.parsed_resume_data) {
        try {
          resumeData = typeof application.parsed_resume_data === 'string' 
            ? JSON.parse(application.parsed_resume_data) 
            : application.parsed_resume_data;
          
          console.log('Parsed resume data structure:', {
            applicationId: application.id,
            hasWorkExperience: !!resumeData?.workExperience,
            workExpLength: resumeData?.workExperience?.length || 0,
            hasPersonalInfo: !!resumeData?.personalInfo,
            hasEducation: !!resumeData?.education,
            hasSkills: !!resumeData?.skills
          });
        } catch (e) {
          console.warn('Failed to parse resume data:', e);
        }
      }

      // CRITICAL FIX: Extract work experience from the correct location with proper formatting
      const processedWorkExperience = (() => {
        let workExpData = null;
        
        // First priority: Extract from parsed resume data (the correct source)
        if (resumeData?.workExperience && Array.isArray(resumeData.workExperience)) {
          workExpData = resumeData.workExperience;
          console.log(`Using work experience from parsed resume data: ${workExpData.length} entries`);
        } 
        // Fallback: Check if it's nested under parsedData
        else if (resumeData?.parsedData?.workExperience && Array.isArray(resumeData.parsedData.workExperience)) {
          workExpData = resumeData.parsedData.workExperience;
          console.log(`Using work experience from parsedData.workExperience: ${workExpData.length} entries`);
        }
        // Last resort: Application work experience field
        else if (Array.isArray(application.work_experience) && application.work_experience.length > 0) {
          workExpData = application.work_experience;
          console.log(`Using work experience from application.work_experience: ${workExpData.length} entries`);
        }

        if (!workExpData || workExpData.length === 0) {
          console.warn(`No work experience data found for application: ${application.id}`);
          return [];
        }

        // Process and format the work experience data for AI analysis
        const formattedExperience = workExpData.slice(0, 5).map((exp: any) => {
          const formatted = {
            company: exp?.company || exp?.employer || 'Unknown company',
            position: exp?.position || exp?.title || 'Unknown position',
            startDate: exp?.startDate || exp?.start_date || 'Unknown start',
            endDate: exp?.endDate || exp?.end_date || 'Present',
            duration: exp?.duration || `${exp?.startDate || exp?.start_date || 'Unknown'} - ${exp?.endDate || exp?.end_date || 'Present'}`,
            description: (exp?.description || 'No description provided').substring(0, 400)
          };
          
          console.log(`Formatted work experience entry: ${formatted.position} at ${formatted.company}`);
          return formatted;
        }).filter(exp => exp.company !== 'Unknown company' || exp.position !== 'Unknown position');

        console.log(`Final processed work experience for ${application.name}: ${formattedExperience.length} entries`);
        return formattedExperience;
      })();

      // CRITICAL FIX: Extract skills from parsed resume data
      const processedSkills = (() => {
        let skillsData = [];
        
        // First priority: From parsed resume data
        if (resumeData?.skills && Array.isArray(resumeData.skills)) {
          skillsData = resumeData.skills.slice(0, 15);
          console.log(`Using skills from parsed resume data: ${skillsData.length} skills`);
        } 
        // Fallback: Check nested structure
        else if (resumeData?.parsedData?.skills && Array.isArray(resumeData.parsedData.skills)) {
          skillsData = resumeData.parsedData.skills.slice(0, 15);
          console.log(`Using skills from parsedData.skills: ${skillsData.length} skills`);
        }
        // Last resort: Application skills
        else if (Array.isArray(application.skills)) {
          skillsData = application.skills.slice(0, 10).map((skill: any) => 
            typeof skill === 'string' ? skill : skill?.name || skill?.skill || 'Unknown skill'
          ).filter(Boolean);
          console.log(`Using skills from application.skills: ${skillsData.length} skills`);
        }

        return skillsData;
      })();

      // CRITICAL FIX: Extract education from parsed resume data
      const processedEducation = (() => {
        let educationData = [];
        
        // First priority: From parsed resume data
        if (resumeData?.education && Array.isArray(resumeData.education)) {
          educationData = resumeData.education.slice(0, 3).map((edu: any) => ({
            institution: edu?.institution || 'Unknown institution',
            degree: edu?.degree || 'Unknown degree',
            field: edu?.field || 'Unknown field',
            year: edu?.graduationDate || edu?.year || 'Unknown year',
            gpa: edu?.gpa || 'Not specified'
          }));
          console.log(`Using education from parsed resume data: ${educationData.length} entries`);
        }
        // Fallback: Check nested structure
        else if (resumeData?.parsedData?.education && Array.isArray(resumeData.parsedData.education)) {
          educationData = resumeData.parsedData.education.slice(0, 3).map((edu: any) => ({
            institution: edu?.institution || 'Unknown institution',
            degree: edu?.degree || 'Unknown degree',
            field: edu?.field || 'Unknown field',
            year: edu?.graduationDate || edu?.year || 'Unknown year',
            gpa: edu?.gpa || 'Not specified'
          }));
          console.log(`Using education from parsedData.education: ${educationData.length} entries`);
        }
        // Last resort: Application education
        else if (Array.isArray(application.education)) {
          educationData = application.education.slice(0, 3).map((edu: any) => ({
            institution: edu?.institution || edu?.school || 'Unknown institution',
            degree: edu?.degree || 'Unknown degree',
            field: edu?.field || edu?.major || 'Unknown field',
            year: edu?.year || edu?.graduation_year || 'Unknown year'
          })).filter(edu => edu.institution !== 'Unknown institution' || edu.degree !== 'Unknown degree');
          console.log(`Using education from application.education: ${educationData.length} entries`);
        }

        return educationData;
      })();

      // Extract professional summary from parsed resume
      const professionalSummary = resumeData?.summary || resumeData?.parsedData?.summary || '';
      const totalExperience = resumeData?.totalExperience || resumeData?.parsedData?.totalExperience || '';

      // Create streamlined analysis data with FIXED work experience extraction
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
        
        // FIXED: Now properly extracts from parsed resume data
        skills: processedSkills.length > 0 ? processedSkills : undefined,
        work_experience: processedWorkExperience.length > 0 ? processedWorkExperience : undefined,
        education: processedEducation.length > 0 ? processedEducation : undefined,
        
        // Resume Data
        resume_file_path: application.resume_file_path || undefined,
        professional_summary: professionalSummary || undefined,
        total_experience: totalExperience || undefined,
        has_parsed_resume: !!resumeData,
        resume_summary: application.resume_summary || undefined,
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

      console.log('FIXED: Calling analyze-application function for:', application.name, 'with structured data:', {
        workExperienceCount: processedWorkExperience.length,
        skillsCount: processedSkills.length,
        educationCount: processedEducation.length,
        hasProfessionalSummary: !!professionalSummary,
        hasParsedResume: !!resumeData
      });

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

        console.log('FIXED: Analysis completed for application:', application.id, {
          rating: data.rating, 
          summaryLength: data.summary.length,
          workExperienceEntriesSent: processedWorkExperience.length,
          skillsSent: processedSkills.length,
          educationSent: processedEducation.length
        });
        return { success: true };
      }

      return { success: false, error: 'No rating or summary returned from analysis' };
    } catch (error) {
      console.error('Error in analysis for application:', application.id, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async processBatch(applications: Application[], job: Job): Promise<{ successCount: number; errorCount: number }> {
    const BATCH_SIZE = 2; // Reduced batch size for more reliable processing
    const BATCH_DELAY = 2000; // Increased delay between batches
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
