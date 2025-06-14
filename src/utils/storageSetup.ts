
import { supabase } from "@/integrations/supabase/client";

export const ensureStorageBucket = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'application-files');
    
    if (!bucketExists) {
      console.log('Creating application-files bucket...');
      // The bucket will be created via SQL migration
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking storage bucket:', error);
    return false;
  }
};
