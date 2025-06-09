
import { useEffect } from 'react';
import { viewTrackingService } from '@/services/viewTrackingService';

export const useViewTracking = (jobId: string, enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled || !jobId) return;

    const trackView = async () => {
      try {
        const userAgent = navigator.userAgent;
        const referrer = document.referrer;

        await viewTrackingService.trackJobView({
          jobId,
          userAgent,
          referrer
        });
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };

    // Track view after a short delay to ensure the page has loaded
    const timeoutId = setTimeout(trackView, 1000);

    return () => clearTimeout(timeoutId);
  }, [jobId, enabled]);
};
