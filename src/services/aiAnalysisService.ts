
import { supabase } from "@/integrations/supabase/client";
import { Application, Job } from "@/types";
import { DASHBOARD_ACTION_CONSTANTS } from "@/constants/dashboardActions";

interface AnalysisData {
  name: string;
  email: string;
  portfolio: string;
  experience: string;
  answer_1: string;
  answer_2: string;
  answer_3: string;
}

interface JobData {
  title: string;
  description: string;
  role_type: string;
  experience_level: string;
  required_skills: string;
}

export class AIAnalysisService {
  static async analyzeApplication(application: Application, job: Job): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Refreshing AI analysis for application:', application.id);
      
      const analysisData: AnalysisData = {
        name: application.name,
        email: application.email,
        portfolio: application.portfolio,
        experience: application.experience || '',
        answer_1: application.answer_1,
        answer_2: application.answer_2,
        answer_3: application.answer_3
      };

      const jobData: JobData = {
        title: job.title,
        description: job.description,
        role_type: job.role_type,
        experience_level: job.experience_level,
        required_skills: job.required_skills
      };

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

        return { success: true };
      }

      return { success: false, error: 'No rating or summary returned' };
    } catch (error) {
      console.error('Error processing application:', application.id, error);
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
