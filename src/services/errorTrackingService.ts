
import { logger } from './loggerService';

export interface ErrorContext {
  userId?: string;
  organizationId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface TrackedError extends Error {
  context?: ErrorContext;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: number;
  userAgent?: string;
  url?: string;
}

class ErrorTrackingService {
  private errorQueue: TrackedError[] = [];
  private maxQueueSize = 100;
  private isOnline = navigator.onLine;

  constructor() {
    this.setupGlobalErrorHandlers();
    this.setupNetworkListeners();
  }

  private setupGlobalErrorHandlers() {
    // Capture unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError(new Error(event.message), {
        component: 'Global',
        action: 'Unhandled Error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      }, 'high');
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          component: 'Global',
          action: 'Unhandled Promise Rejection'
        },
        'high'
      );
    });
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  trackError(
    error: Error, 
    context: ErrorContext = {}, 
    severity: TrackedError['severity'] = 'medium'
  ): void {
    const trackedError: TrackedError = {
      ...error,
      context,
      severity,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log locally
    const logLevel = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    logger[logLevel]('Error tracked:', {
      message: error.message,
      stack: error.stack,
      context,
      severity
    });

    // Add to queue for potential remote tracking
    this.addToQueue(trackedError);

    // Handle critical errors immediately
    if (severity === 'critical') {
      this.handleCriticalError(trackedError);
    }
  }

  private addToQueue(error: TrackedError): void {
    this.errorQueue.push(error);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Try to flush if online
    if (this.isOnline) {
      this.flushErrorQueue();
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (!this.isOnline || this.errorQueue.length === 0) {
      return;
    }

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In a real application, you would send these to your error tracking service
      // For now, we'll just log that we would send them
      logger.debug('Would send errors to tracking service:', errorsToSend.length);
      
      // Example: await sendToErrorService(errorsToSend);
    } catch (error) {
      logger.warn('Failed to send errors to tracking service:', error);
      // Re-add errors to queue for retry
      this.errorQueue.unshift(...errorsToSend);
    }
  }

  private handleCriticalError(error: TrackedError): void {
    // For critical errors, we might want to:
    // 1. Show user notification
    // 2. Save state to localStorage
    // 3. Attempt immediate retry of failed operation
    
    logger.error('Critical error occurred:', error);
    
    // Save application state for recovery
    try {
      const currentState = {
        timestamp: Date.now(),
        url: window.location.href,
        error: {
          message: error.message,
          context: error.context
        }
      };
      
      localStorage.setItem('lastCriticalError', JSON.stringify(currentState));
    } catch (e) {
      logger.warn('Failed to save error state to localStorage');
    }
  }

  getErrorStats(): {
    totalErrors: number;
    errorsBySeverity: Record<string, number>;
    recentErrors: TrackedError[];
  } {
    const errorsBySeverity = this.errorQueue.reduce((acc, error) => {
      const severity = error.severity || 'medium';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentErrors = this.errorQueue
      .slice(-10)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return {
      totalErrors: this.errorQueue.length,
      errorsBySeverity,
      recentErrors
    };
  }

  clearErrorQueue(): void {
    this.errorQueue = [];
    localStorage.removeItem('lastCriticalError');
  }
}

export const errorTrackingService = new ErrorTrackingService();

// Utility function for wrapping async operations with error tracking
export const withErrorTracking = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: ErrorContext = {}
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorTrackingService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        {
          ...context,
          action: context.action || fn.name || 'Unknown async operation'
        }
      );
      throw error;
    }
  }) as T;
};
