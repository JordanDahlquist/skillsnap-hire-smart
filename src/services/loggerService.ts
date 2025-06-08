
// Legacy logger service - now delegates to production logger
import { productionLogger } from './productionLoggerService';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class LegacyLoggerService {
  debug(message: string, ...args: any[]) {
    productionLogger.debug(message, undefined, ...args);
  }

  info(message: string, ...args: any[]) {
    productionLogger.info(message, undefined, ...args);
  }

  warn(message: string, ...args: any[]) {
    productionLogger.warn(message, undefined, ...args);
  }

  error(message: string, ...args: any[]) {
    productionLogger.error(message, undefined, ...args);
  }

  // Utility method for logging component lifecycle events
  componentMount(componentName: string, props?: any) {
    productionLogger.componentMount(componentName, props);
  }

  componentUnmount(componentName: string) {
    productionLogger.componentUnmount(componentName);
  }

  // Utility method for logging API calls
  apiCall(method: string, endpoint: string, data?: any) {
    productionLogger.apiCall(method, endpoint, data);
  }

  apiResponse(method: string, endpoint: string, response: any) {
    productionLogger.apiResponse(method, endpoint, response);
  }

  // Utility method for logging user actions
  userAction(action: string, details?: any) {
    productionLogger.userAction(action, details);
  }
}

// Export for backward compatibility
export const logger = new LegacyLoggerService();
