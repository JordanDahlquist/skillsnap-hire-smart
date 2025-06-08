
import { productionLogger } from "@/services/productionLoggerService";
import { environment } from "@/config/environment";

// Performance monitoring utility
export const withPerformanceTracking = (operation: string) => {
  const startTime = Date.now();
  return () => {
    const duration = Date.now() - startTime;
    if (environment.enablePerformanceMonitoring) {
      productionLogger.performance(operation, duration);
    }
  };
};
