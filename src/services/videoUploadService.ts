
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

  private async uploadWithProgress(
    blob: Blob,
    filePath: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<any> {
    // Validate blob before upload
    if (!blob || blob.size === 0) {
      throw new Error('Invalid or empty video file');
    }
    
    // Log upload details for debugging
    logger.debug(`Upload attempt: ${filePath}, size: ${blob.size} bytes, type: ${blob.type}`);
    
    // Get Supabase auth headers
    const { data: { session } } = await supabase.auth.getSession();
    const authHeader = session?.access_token ? `Bearer ${session.access_token}` : '';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybnNjd2FkY2V0YmltcHN0bnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzg5MDksImV4cCI6MjA2NDc1NDkwOX0.zWkFNauyxZ7t8omUVH7o7oarg8NTV35PXKp3xe7gx_o';
    
    // First try direct XMLHttpRequest approach
    try {
      return await this.uploadWithXHR(blob, filePath, authHeader, apiKey, onProgress);
    } catch (xhrError) {
      logger.warn(`XMLHttpRequest upload failed, trying Supabase SDK: ${xhrError}`);
      // Fallback to Supabase SDK with progress simulation
      return await this.uploadWithSDK(blob, filePath, onProgress);
    }
  }

  private async uploadWithXHR(
    blob: Blob,
    filePath: string,
    authHeader: string,
    apiKey: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Setup upload progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage
            });
          }
        });
      }

      // Setup completion handlers
      xhr.addEventListener('load', () => {
        logger.debug(`Upload response: status=${xhr.status}, body=${xhr.responseText}`);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({ data: response, error: null });
          } catch (e) {
            resolve({ data: { path: filePath }, error: null });
          }
        } else {
          let errorMessage = `Upload failed with status ${xhr.status}`;
          try {
            const errorBody = JSON.parse(xhr.responseText);
            errorMessage += `: ${errorBody.error || errorBody.message || xhr.responseText}`;
          } catch (e) {
            errorMessage += `: ${xhr.responseText}`;
          }
          logger.error(`Upload error: ${errorMessage}`);
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener('error', () => {
        logger.error('XMLHttpRequest network error');
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('timeout', () => {
        logger.error('XMLHttpRequest timeout');
        reject(new Error('Upload timeout'));
      });

      // Configure request
      xhr.timeout = 300000; // 5 minute timeout
      xhr.open('POST', `https://wrnscwadcetbimpstnpu.supabase.co/storage/v1/object/application-files/${filePath}`);
      
      // Set headers - let browser set Content-Type automatically for better compatibility
      xhr.setRequestHeader('Authorization', authHeader);
      xhr.setRequestHeader('apikey', apiKey);
      xhr.setRequestHeader('x-upsert', 'true'); // Allow file updates
      
      logger.debug(`Upload headers: Authorization=${authHeader ? 'set' : 'missing'}, apikey=${apiKey ? 'set' : 'missing'}`);
      
      // Send blob directly
      xhr.send(blob);
    });
  }

  private async uploadWithSDK(
    blob: Blob,
    filePath: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<any> {
    // Simulate progress for SDK upload
    if (onProgress) {
      const progressInterval = setInterval(() => {
        const randomProgress = Math.min(Math.random() * 100, 90);
        onProgress({
          loaded: Math.floor((randomProgress / 100) * blob.size),
          total: blob.size,
          percentage: Math.floor(randomProgress)
        });
      }, 500);

      try {
        const { data, error } = await supabase.storage
          .from('application-files')
          .upload(filePath, blob, {
            upsert: true,
            contentType: 'video/webm'
          });

        clearInterval(progressInterval);
        
        if (onProgress) {
          onProgress({ loaded: blob.size, total: blob.size, percentage: 100 });
        }

        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    } else {
      // No progress tracking needed
      const { data, error } = await supabase.storage
        .from('application-files')
        .upload(filePath, blob, {
          upsert: true,
          contentType: 'video/webm'
        });

      if (error) throw error;
      return { data, error: null };
    }
  }

  private async uploadInChunks(
    blob: Blob,
    filePath: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<any> {
    // Use the new XMLHttpRequest-based upload with real progress tracking
    return this.uploadWithProgress(blob, filePath, onProgress);
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
