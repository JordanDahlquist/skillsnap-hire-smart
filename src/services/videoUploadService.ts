
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
  private maxChunkSize = 50 * 1024 * 1024; // 50MB chunks

  private simulateProgress(
    blob: Blob,
    onProgress: (progress: UploadProgress) => void,
    uploadPromise: Promise<any>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const fileSize = blob.size;
      const estimatedDuration = Math.max(3000, Math.min(fileSize / 1000, 30000)); // 3-30 seconds
      const updateInterval = 100; // Update every 100ms
      const totalUpdates = estimatedDuration / updateInterval;
      const progressIncrement = 85 / totalUpdates; // Go up to 85%, then jump to 100% when done
      
      let currentProgress = 0;
      let progressTimer: NodeJS.Timeout;

      const updateProgress = () => {
        if (currentProgress < 85) {
          currentProgress += progressIncrement;
          onProgress({
            loaded: Math.round((currentProgress / 100) * fileSize),
            total: fileSize,
            percentage: Math.round(currentProgress)
          });
          progressTimer = setTimeout(updateProgress, updateInterval);
        }
      };

      // Start simulated progress
      updateProgress();

      // Handle the actual upload
      uploadPromise
        .then((result) => {
          clearTimeout(progressTimer);
          // Complete the progress
          onProgress({ loaded: fileSize, total: fileSize, percentage: 100 });
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(progressTimer);
          reject(error);
        });
    });
  }

  private async uploadInChunks(
    blob: Blob,
    filePath: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<any> {
    const fileSize = blob.size;
    
    // If file is small enough, upload directly
    if (fileSize <= this.maxChunkSize) {
      const uploadPromise = supabase.storage
        .from('application-files')
        .upload(filePath, blob, {
          contentType: blob.type || 'video/webm',
          cacheControl: '3600',
          upsert: false
        });

      if (onProgress) {
        return this.simulateProgress(blob, onProgress, uploadPromise);
      }
      return uploadPromise;
    }

    // For larger files, we still use direct upload but with better progress simulation
    // Note: Supabase doesn't support true chunked uploads, but we can simulate better progress
    const uploadPromise = supabase.storage
      .from('application-files')
      .upload(filePath, blob, {
        contentType: blob.type || 'video/webm',
        cacheControl: '3600',
        upsert: false
      });

    if (onProgress) {
      return this.simulateProgress(blob, onProgress, uploadPromise);
    }
    return uploadPromise;
  }

  async uploadVideo(
    blob: Blob, 
    questionIndex: number, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    let attempt = 0;
    
    // Log file size for debugging
    const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
    logger.debug(`Starting upload: ${sizeInMB}MB file for question ${questionIndex + 1}`);
    
    while (attempt < this.retryAttempts) {
      try {
        attempt++;
        logger.debug(`Attempting video upload, attempt ${attempt}/${this.retryAttempts}`);
        
        const fileName = `interview-video-${Date.now()}-q${questionIndex + 1}.webm`;
        const filePath = `interview-videos/${fileName}`;

        if (onProgress) {
          onProgress({ loaded: 0, total: blob.size, percentage: 0 });
        }

        // Upload with chunking support and progress simulation
        const { data, error } = await this.uploadInChunks(blob, filePath, onProgress);

        if (error) {
          // Provide specific error messages based on actual issues
          if (error.message.includes('not found') || error.message.includes('bucket')) {
            throw new Error('Storage system not available. Please contact support.');
          } else if (error.message.includes('policy') || error.message.includes('permission') || error.message.includes('RLS')) {
            throw new Error('Upload permission issue. Please contact support.');
          } else if (error.message.includes('payload') || error.message.includes('request entity')) {
            throw new Error(`File too large (${sizeInMB}MB). Please try recording a shorter video or contact support.`);
          } else if (error.message.includes('timeout') || error.message.includes('network')) {
            throw new Error('Network timeout. Please check your connection and try again.');
          } else {
            throw new Error(`Upload failed: ${error.message}`);
          }
        }

        const { data: { publicUrl } } = supabase.storage
          .from('application-files')
          .getPublicUrl(filePath);

        logger.debug(`Video upload successful: ${publicUrl} (${sizeInMB}MB)`);
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
