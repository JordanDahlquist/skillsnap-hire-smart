
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class ProductionLoggerService {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;
  private logBuffer: Array<{ level: LogLevel; message: string; context?: LogContext; timestamp: number }> = [];
  private maxBufferSize = 100;

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (context?.component) {
      return `${prefix} [${context.component}] ${message}`;
    }
    
    return `${prefix} ${message}`;
  }

  private addToBuffer(level: LogLevel, message: string, context?: LogContext) {
    this.logBuffer.push({
      level,
      message,
      context,
      timestamp: Date.now()
    });

    // Maintain buffer size
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, ...args: any[]) {
    this.addToBuffer(level, message, context);
    
    if (!this.shouldLog(level)) return;
    
    const formattedMessage = this.formatMessage(level, message, context);
    
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage, context?.metadata, ...args);
        }
        break;
      case 'info':
        if (this.isDevelopment) {
          console.info(formattedMessage, context?.metadata, ...args);
        }
        break;
      case 'warn':
        console.warn(formattedMessage, context?.metadata, ...args);
        break;
      case 'error':
        console.error(formattedMessage, context?.metadata, ...args);
        break;
    }
  }

  debug(message: string, context?: LogContext, ...args: any[]) {
    this.log('debug', message, context, ...args);
  }

  info(message: string, context?: LogContext, ...args: any[]) {
    this.log('info', message, context, ...args);
  }

  warn(message: string, context?: LogContext, ...args: any[]) {
    this.log('warn', message, context, ...args);
  }

  error(message: string, context?: LogContext, ...args: any[]) {
    this.log('error', message, context, ...args);
  }

  // Development-only methods
  componentMount(componentName: string, props?: any) {
    if (this.isDevelopment) {
      this.debug(`${componentName} mounted`, { component: componentName, metadata: props });
    }
  }

  componentUnmount(componentName: string) {
    if (this.isDevelopment) {
      this.debug(`${componentName} unmounted`, { component: componentName });
    }
  }

  apiCall(method: string, endpoint: string, data?: any) {
    if (this.isDevelopment) {
      this.debug(`API ${method} ${endpoint}`, { action: 'API_CALL', metadata: { method, endpoint, data } });
    }
  }

  apiResponse(method: string, endpoint: string, response: any, duration?: number) {
    if (this.isDevelopment) {
      this.debug(`API ${method} ${endpoint} response`, { 
        action: 'API_RESPONSE', 
        metadata: { method, endpoint, response, duration: duration ? `${duration}ms` : undefined } 
      });
    }
  }

  userAction(action: string, details?: any) {
    this.info(`User action: ${action}`, { action: 'USER_ACTION', metadata: details });
  }

  performance(operation: string, duration: number, metadata?: any) {
    if (duration > 1000) {
      this.warn(`Slow operation: ${operation} took ${duration}ms`, { 
        action: 'PERFORMANCE', 
        metadata: { operation, duration, ...metadata } 
      });
    } else if (this.isDevelopment) {
      this.debug(`Performance: ${operation} took ${duration}ms`, { 
        action: 'PERFORMANCE', 
        metadata: { operation, duration, ...metadata } 
      });
    }
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50) {
    return this.logBuffer.slice(-count);
  }

  // Clear log buffer
  clearLogs() {
    this.logBuffer = [];
  }
}

export const productionLogger = new ProductionLoggerService();
