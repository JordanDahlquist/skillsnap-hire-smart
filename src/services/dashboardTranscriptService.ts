
import { Application, Job } from "@/types";
import { TranscriptionService } from "./transcriptionService";
import { AIAnalysisService } from "./aiAnalysisService";
import { logger } from "./loggerService";

export class DashboardTranscriptService {
  static async processAndAnalyzeApplication(application: Application, job: Job): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug('Processing transcripts and AI analysis for application:', application.id);

      // Step 1: Process transcripts if needed
      if (application.transcript_processing_status === 'pending' || 
          application.transcript_processing_status === 'failed') {
        
        const transcriptResult = await TranscriptionService.processApplicationTranscripts(application);
        
        if (!transcriptResult.success) {
          logger.error('Transcript processing failed for application:', application.id, transcriptResult.error);
          // Continue with AI analysis even if transcripts fail
        } else {
          logger.debug('Transcript processing completed for application:', application.id);
        }
      }

      // Step 2: Run AI analysis (will use transcripts if available)
      const analysisResult = await AIAnalysisService.analyzeApplication(application, job);
      
      if (!analysisResult.success) {
        return { success: false, error: analysisResult.error };
      }

      return { success: true };
    } catch (error) {
      logger.error('Error in processAndAnalyzeApplication:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async batchProcessAndAnalyze(applications: Application[], job: Job): Promise<{ successCount: number; errorCount: number }> {
    let successCount = 0;
    let errorCount = 0;

    for (const application of applications) {
      const result = await this.processAndAnalyzeApplication(application, job);
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }

      // Small delay between applications
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    return { successCount, errorCount };
  }
}
