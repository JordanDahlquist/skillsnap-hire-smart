
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class LoggerService {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (!this.isDevelopment && level === 'debug') return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'debug':
        console.debug(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }

  // Utility method for logging component lifecycle events
  componentMount(componentName: string, props?: any) {
    this.debug(`${componentName} mounted`, props);
  }

  componentUnmount(componentName: string) {
    this.debug(`${componentName} unmounted`);
  }

  // Utility method for logging API calls
  apiCall(method: string, endpoint: string, data?: any) {
    this.debug(`API ${method} ${endpoint}`, data);
  }

  apiResponse(method: string, endpoint: string, response: any) {
    this.debug(`API ${method} ${endpoint} response:`, response);
  }

  // Utility method for logging user actions
  userAction(action: string, details?: any) {
    this.info(`User action: ${action}`, details);
  }
}

export const logger = new LoggerService();
