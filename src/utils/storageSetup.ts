
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

    // Test bucket accessibility with a small test
    try {
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testPath = `test-uploads/bucket-test-${Date.now()}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from('application-files')
        .upload(testPath, testBlob);

      if (uploadError) {
        logger.error('Bucket upload test failed:', uploadError);
        return false;
      }

      // Clean up test file
      await supabase.storage
        .from('application-files')
        .remove([testPath]);

      logger.debug('Storage bucket validation successful');
      return true;
      
    } catch (testError) {
      logger.error('Bucket accessibility test failed:', testError);
      return false;
    }

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
