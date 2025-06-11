
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { useStandardizedError } from "@/hooks/useStandardizedError";
import { SUCCESS_MESSAGES } from "@/constants/messages";

export const useJobsPageActions = (refetch: () => void) => {
  const { toast } = useToast();
  const { execute: executeAsync } = useAsyncOperation();
  const { handleError } = useStandardizedError();

  const handleRefresh = useCallback(async () => {
    try {
      await executeAsync(
        async () => {
          await refetch();
          return true;
        },
        {
          logOperation: 'Manual refresh triggered',
          onSuccess: () => {
            toast({
              title: "Refreshed",
              description: SUCCESS_MESSAGES.UPDATED,
            });
          }
        }
      );
    } catch (error) {
      handleError(error, {
        component: 'OptimizedJobsPage',
        action: 'Manual refresh',
        toastTitle: 'Refresh failed',
        fallbackMessage: 'Unable to refresh jobs. Please try again.'
      });
    }
  }, [executeAsync, refetch, toast, handleError]);

  return {
    handleRefresh
  };
};
