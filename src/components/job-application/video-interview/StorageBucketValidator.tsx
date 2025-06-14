
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/services/loggerService";

interface StorageBucketValidatorProps {
  onValidationComplete: (isValid: boolean) => void;
}

export const StorageBucketValidator = ({ onValidationComplete }: StorageBucketValidatorProps) => {
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    validateStorageBucket();
  }, []);

  const validateStorageBucket = async () => {
    try {
      setIsValidating(true);
      setValidationError(null);
      
      logger.debug('Validating storage bucket availability...');
      
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        throw new Error(`Failed to list buckets: ${listError.message}`);
      }

      const bucketExists = buckets?.some(bucket => bucket.name === 'application-files');
      
      if (!bucketExists) {
        throw new Error('Storage bucket "application-files" not found. Please contact support.');
      }

      // Test upload capability with a small test file
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testPath = `test-uploads/connectivity-test-${Date.now()}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from('application-files')
        .upload(testPath, testBlob);

      if (uploadError) {
        throw new Error(`Storage upload test failed: ${uploadError.message}`);
      }

      // Clean up test file
      await supabase.storage
        .from('application-files')
        .remove([testPath]);

      logger.debug('Storage bucket validation successful');
      setIsValid(true);
      onValidationComplete(true);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage validation error';
      logger.error('Storage bucket validation failed:', error);
      setValidationError(errorMessage);
      setIsValid(false);
      onValidationComplete(false);
      toast.error('Storage system unavailable. Please try again later.');
    } finally {
      setIsValidating(false);
    }
  };

  if (isValidating) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Verifying storage system availability...
        </AlertDescription>
      </Alert>
    );
  }

  if (validationError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Storage Error: {validationError}
        </AlertDescription>
      </Alert>
    );
  }

  if (isValid) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          Storage system ready for video uploads
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
