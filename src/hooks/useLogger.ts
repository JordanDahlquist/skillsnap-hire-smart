
import { useEffect, useRef } from 'react';
import { logger } from '@/services/loggerService';

export const useLogger = (componentName: string) => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
    logger.componentMount(`${componentName} (render #${renderCount.current})`);
    
    return () => {
      logger.componentUnmount(componentName);
    };
  }, [componentName]);

  const logUserAction = (action: string, details?: any) => {
    logger.userAction(`${componentName}: ${action}`, details);
  };

  const logApiCall = (method: string, endpoint: string, data?: any) => {
    logger.apiCall(method, endpoint, data);
  };

  const logApiResponse = (method: string, endpoint: string, response: any) => {
    logger.apiResponse(method, endpoint, response);
  };

  const logDebug = (message: string, ...args: any[]) => {
    logger.debug(`${componentName}: ${message}`, ...args);
  };

  const logInfo = (message: string, ...args: any[]) => {
    logger.info(`${componentName}: ${message}`, ...args);
  };

  const logWarn = (message: string, ...args: any[]) => {
    logger.warn(`${componentName}: ${message}`, ...args);
  };

  const logError = (message: string, ...args: any[]) => {
    logger.error(`${componentName}: ${message}`, ...args);
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
