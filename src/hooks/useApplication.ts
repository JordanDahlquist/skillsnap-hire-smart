
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggerService";
import { Application } from "@/types";

export const useApplication = (applicationId: string | undefined) => {
  return useQuery({
    queryKey: ['application', applicationId],
    queryFn: async (): Promise<Application | null> => {
      if (!applicationId) {
        throw new Error('Application ID is required');
      }

      logger.debug('Fetching single application:', { applicationId });

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching application:', error);
        throw error;
      }

      if (!data) {
        logger.warn('Application not found:', { applicationId });
        return null;
      }

      logger.debug('Application fetched successfully:', { applicationId });
      return data as Application;
    },
    enabled: !!applicationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });
};
