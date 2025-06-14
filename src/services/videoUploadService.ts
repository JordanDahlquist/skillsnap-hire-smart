
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
  private retryDelay = 1000; // Start with 1 second

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

        // Simulate progress updates for better UX
        if (onProgress) {
          onProgress({ loaded: 0, total: blob.size, percentage: 0 });
        }

        const { data, error } = await supabase.storage
          .from('application-files')
          .upload(filePath, blob, {
            contentType: 'video/webm',
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw new Error(`Upload failed: ${error.message}`);
        }

        if (onProgress) {
          onProgress({ loaded: blob.size, total: blob.size, percentage: 100 });
        }

        const { data: { publicUrl } } = supabase.storage
          .from('application-files')
          .getPublicUrl(filePath);

        // Verify the upload by checking if the file exists
        const { data: fileData, error: verifyError } = await supabase.storage
          .from('application-files')
          .list('interview-videos', {
            search: fileName
          });

        if (verifyError || !fileData?.some(file => file.name === fileName)) {
          throw new Error('Upload verification failed - file not found after upload');
        }

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
