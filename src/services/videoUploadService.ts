
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "./loggerService";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

class VideoUploadService {
  private retryAttempts = 3;
  private retryDelay = 1000;

  async uploadVideo(
    blob: Blob, 
    questionIndex: number, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    let attempt = 0;
    
    while (attempt < this.retryAttempts) {
      try {
        attempt++;
        logger.debug(`Attempting video upload, attempt ${attempt}/${this.retryAttempts}`);
        
        const fileName = `interview-video-${Date.now()}-q${questionIndex + 1}.webm`;
        const filePath = `interview-videos/${fileName}`;

        if (onProgress) {
          onProgress({ loaded: 0, total: blob.size, percentage: 0 });
        }

        // Direct upload without redundant validation checks
        const { data, error } = await supabase.storage
          .from('application-files')
          .upload(filePath, blob, {
            contentType: 'video/webm',
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          // Provide helpful error messages based on common issues
          if (error.message.includes('not found')) {
            throw new Error('Storage system not available. Please contact support.');
          } else if (error.message.includes('policy') || error.message.includes('permission')) {
            throw new Error('Upload permission issue. Please contact support.');
          } else if (error.message.includes('size') || error.message.includes('large')) {
            throw new Error('Video file too large. Please try recording a shorter video.');
          } else {
            throw new Error(`Upload failed: ${error.message}`);
          }
        }

        if (onProgress) {
          onProgress({ loaded: blob.size, total: blob.size, percentage: 100 });
        }

        const { data: { publicUrl } } = supabase.storage
          .from('application-files')
          .getPublicUrl(filePath);

        logger.debug(`Video upload successful: ${publicUrl}`);
        return {
          success: true,
          url: publicUrl
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
        logger.error(`Video upload attempt ${attempt} failed:`, error);
        
        if (attempt === this.retryAttempts) {
          logger.error(`All ${this.retryAttempts} upload attempts failed for question ${questionIndex + 1}`);
          return {
            success: false,
            error: `Upload failed after ${this.retryAttempts} attempts: ${errorMessage}`
          };
        }
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }

    return {
      success: false,
      error: 'Maximum retry attempts exceeded'
    };
  }

  async validateVideoAccess(videoUrl: string): Promise<boolean> {
    try {
      const response = await fetch(videoUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      logger.error('Video access validation failed:', error);
      return false;
    }
  }
}

export const videoUploadService = new VideoUploadService();
