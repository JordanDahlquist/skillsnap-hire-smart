
import { supabase } from "@/integrations/supabase/client";
import { logger } from "./loggerService";
import { Application } from "@/types";
import { VideoTranscript } from "@/types/supabase";
import { safeParseSkillsTestResponses } from "@/utils/typeGuards";

export class TranscriptionService {
  static async transcribeVideo(videoUrl: string, questionIndex: number, questionText: string): Promise<VideoTranscript> {
    try {
      const { data, error } = await supabase.functions.invoke('transcribe-video', {
        body: {
          videoUrl,
          questionIndex,
          questionText
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      logger.error('Error transcribing video:', error);
      throw error;
    }
  }

  static async processApplicationTranscripts(application: Application): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug('Processing transcripts for application:', application.id);

      // Update status to processing
      await supabase
        .from('applications')
        .update({
          transcript_processing_status: 'processing',
          transcript_last_processed_at: new Date().toISOString()
        })
        .eq('id', application.id);

      const skillsTranscripts: VideoTranscript[] = [];
      const interviewTranscripts: VideoTranscript[] = [];

      // Process skills assessment videos
      const skillsResponses = safeParseSkillsTestResponses(application.skills_test_responses || []);

      for (let i = 0; i < skillsResponses.length; i++) {
        const response = skillsResponses[i];
        if (response.answerType === 'video' && response.videoUrl) {
          try {
            const transcript = await this.transcribeVideo(
              response.videoUrl,
              i,
              response.question || `Skills Question ${i + 1}`
            );
            skillsTranscripts.push(transcript);
            logger.debug(`Transcribed skills video ${i + 1}:`, transcript.transcript.substring(0, 100));
          } catch (error) {
            logger.error(`Failed to transcribe skills video ${i + 1}:`, error);
          }
        }
      }

      // Process interview videos
      let interviewResponses = [];
      
      if (application.interview_video_responses) {
        try {
          if (Array.isArray(application.interview_video_responses)) {
            interviewResponses = application.interview_video_responses;
          } else if (typeof application.interview_video_responses === 'string') {
            interviewResponses = JSON.parse(application.interview_video_responses);
          }
        } catch (error) {
          logger.error('Error parsing interview_video_responses:', error);
        }
      }

      // Fallback to old interview_video_url format
      if (interviewResponses.length === 0 && application.interview_video_url) {
        try {
          const parsed = JSON.parse(application.interview_video_url);
          if (Array.isArray(parsed)) {
            interviewResponses = parsed;
          } else if (application.interview_video_url.startsWith('http') || application.interview_video_url.startsWith('blob:')) {
            interviewResponses = [{
              question: 'Video Interview Response',
              questionIndex: 0,
              answerType: 'video',
              videoUrl: application.interview_video_url,
              answer: 'Video response'
            }];
          }
        } catch (error) {
          if (application.interview_video_url.startsWith('http') || application.interview_video_url.startsWith('blob:')) {
            interviewResponses = [{
              question: 'Video Interview Response',
              questionIndex: 0,
              answerType: 'video',
              videoUrl: application.interview_video_url,
              answer: 'Video response'
            }];
          }
        }
      }

      for (let i = 0; i < interviewResponses.length; i++) {
        const response = interviewResponses[i];
        if (response.answerType === 'video' && response.videoUrl) {
          try {
            const transcript = await this.transcribeVideo(
              response.videoUrl,
              response.questionIndex !== undefined ? response.questionIndex : i,
              response.question || `Interview Question ${i + 1}`
            );
            interviewTranscripts.push(transcript);
            logger.debug(`Transcribed interview video ${i + 1}:`, transcript.transcript.substring(0, 100));
          } catch (error) {
            logger.error(`Failed to transcribe interview video ${i + 1}:`, error);
          }
        }
      }

      // Update application with transcripts
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          skills_video_transcripts: skillsTranscripts as any,
          interview_video_transcripts: interviewTranscripts as any,
          transcript_processing_status: 'completed',
          transcript_last_processed_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (updateError) {
        throw updateError;
      }

      logger.debug('Transcript processing completed for application:', application.id, {
        skillsTranscripts: skillsTranscripts.length,
        interviewTranscripts: interviewTranscripts.length
      });

      return { success: true };
    } catch (error) {
      logger.error('Error processing application transcripts:', error);

      // Update status to failed
      await supabase
        .from('applications')
        .update({
          transcript_processing_status: 'failed',
          transcript_last_processed_at: new Date().toISOString()
        })
        .eq('id', application.id);

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async batchProcessTranscripts(applications: Application[]): Promise<{ successCount: number; errorCount: number }> {
    let successCount = 0;
    let errorCount = 0;

    for (const application of applications) {
      // Only process if transcripts haven't been processed yet or failed
      if (application.transcript_processing_status === 'pending' || 
          application.transcript_processing_status === 'failed') {
        const result = await this.processApplicationTranscripts(application);
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }

        // Small delay between applications to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { successCount, errorCount };
  }
}
