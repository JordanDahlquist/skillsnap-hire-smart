
import { useEffect, useRef } from 'react';
import { productionLogger } from '@/services/productionLoggerService';

export const useLogger = (componentName: string) => {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(Date.now());

  useEffect(() => {
    renderCount.current++;
    mountTime.current = Date.now();
    
    productionLogger.componentMount(componentName, { renderCount: renderCount.current });
    
    return () => {
      const mountDuration = Date.now() - mountTime.current;
      productionLogger.componentUnmount(componentName);
      
      // Track components that stay mounted for a long time
      if (mountDuration > 60000) { // 1 minute
        productionLogger.performance(`${componentName} mount duration`, mountDuration);
      }
    };
  }, [componentName]);

  const logUserAction = (action: string, details?: any) => {
    productionLogger.userAction(`${componentName}: ${action}`, details);
  };

  const logApiCall = (method: string, endpoint: string, data?: any) => {
    productionLogger.apiCall(method, endpoint, data);
  };

  const logApiResponse = (method: string, endpoint: string, response: any, duration?: number) => {
    productionLogger.apiResponse(method, endpoint, response, duration);
  };

  const logDebug = (message: string, ...args: any[]) => {
    productionLogger.debug(`${componentName}: ${message}`, {
      component: componentName,
      metadata: args.length > 0 ? args : undefined
    });
  };

  const logInfo = (message: string, ...args: any[]) => {
    productionLogger.info(`${componentName}: ${message}`, {
      component: componentName,
      metadata: args.length > 0 ? args : undefined
    });
  };

  const logWarn = (message: string, ...args: any[]) => {
    productionLogger.warn(`${componentName}: ${message}`, {
      component: componentName,
      metadata: args.length > 0 ? args : undefined
    });
  };

  const logError = (message: string, ...args: any[]) => {
    productionLogger.error(`${componentName}: ${message}`, {
      component: componentName,
      metadata: args.length > 0 ? args : undefined
    });
  };

  return {
    logUserAction,
    logApiCall,
    logApiResponse,
    logDebug,
    logInfo,
    logWarn,
    logError,
    renderCount: renderCount.current
  };
};
