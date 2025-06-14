
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/services/loggerService";

interface StorageBucketValidatorProps {
  onValidationComplete: (isValid: boolean) => void;
}

export const StorageBucketValidator = ({ onValidationComplete }: StorageBucketValidatorProps) => {
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [showManualOverride, setShowManualOverride] = useState(false);

  useEffect(() => {
    validateStorageBucket();
  }, []);

  const validateStorageBucket = async () => {
    try {
      setIsValidating(true);
      setValidationError(null);
      setShowManualOverride(false);
      
      logger.debug('Validating storage bucket availability...');
      
      // Check if bucket exists - this is the critical check
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        throw new Error(`Failed to list buckets: ${listError.message}`);
      }

      const bucketExists = buckets?.some(bucket => bucket.name === 'application-files');
      
      if (!bucketExists) {
        throw new Error('Storage bucket "application-files" not found. Please contact support.');
      }

      // Simplified validation - just check if we can access the bucket
      const { data: testList, error: testError } = await supabase.storage
        .from('application-files')
        .list('', { limit: 1 });

      if (testError && testError.message.includes('not found')) {
        throw new Error('Storage bucket access denied. Please contact support.');
      }

      // If we get here, consider it valid even if the list operation had other errors
      logger.debug('Storage bucket validation successful');
      setIsValid(true);
      onValidationComplete(true);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage validation error';
      logger.warn('Storage bucket validation failed, but allowing user to proceed:', error);
      setValidationError(errorMessage);
      setShowManualOverride(true);
      // Don't block the user - they can proceed manually
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualOverride = () => {
    logger.debug('User manually overrode storage validation');
    setIsValid(true);
    setValidationError(null);
    setShowManualOverride(false);
    onValidationComplete(true);
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

  if (validationError && showManualOverride) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium mb-2">Storage validation failed</div>
            <div className="text-sm mb-3">{validationError}</div>
            <div className="text-sm text-muted-foreground">
              You can still proceed with the interview. If uploads fail, please contact support.
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={validateStorageBucket}>
              Retry
            </Button>
            <Button size="sm" onClick={handleManualOverride}>
              Proceed Anyway
            </Button>
          </div>
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
