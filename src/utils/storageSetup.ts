
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggerService";

export const ensureStorageBucket = async (): Promise<boolean> => {
  try {
    logger.debug('Checking application-files bucket existence...');
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      logger.error('Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'application-files');
    
    if (!bucketExists) {
      logger.error('Application-files bucket does not exist');
      return false;
    }

    logger.debug('Storage bucket validation successful');
    return true;
    
  } catch (error) {
    logger.error('Error checking storage bucket:', error);
    return false;
  }
};

export const validateVideoUrl = async (videoUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(videoUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    logger.error('Video URL validation failed:', error);
    return false;
  }
};
