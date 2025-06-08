
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { errorTrackingService } from "@/services/errorTrackingService";
import { logger } from "@/services/loggerService";

interface ErrorHandlerOptions {
  component?: string;
  action?: string;
  showToast?: boolean;
  toastTitle?: string;
  fallbackMessage?: string;
}

export const useStandardizedError = () => {
  const { toast } = useToast();

  const handleError = useCallback((
    error: Error | unknown, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      component = 'Unknown',
      action = 'Unknown action',
      showToast = true,
      toastTitle = "Something went wrong",
      fallbackMessage = "An unexpected error occurred. Please try again."
    } = options;

    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log the error
    logger.error(`[${component}] ${action} failed:`, error);
    
    // Track the error
    errorTrackingService.trackError(
      error instanceof Error ? error : new Error(errorMessage),
      { component, action },
      'medium'
    );

    // Show user-friendly toast
    if (showToast) {
      toast({
        title: toastTitle,
        description: fallbackMessage,
        variant: "destructive",
      });
    }

    return errorMessage;
  }, [toast]);

  return { handleError };
};
