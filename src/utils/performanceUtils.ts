
import { logger } from '@/services/loggerService';
import { PERFORMANCE_CONSTANTS } from '@/constants/ui';

export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  startTiming(label: string): string {
    const timingId = `${label}-${Date.now()}`;
    this.metrics.set(timingId, performance.now());
    return timingId;
  }

  endTiming(timingId: string): number {
    const startTime = this.metrics.get(timingId);
    if (!startTime) {
      logger.warn('No start time found for timing ID:', timingId);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(timingId);
    
    const label = timingId.split('-')[0];
    logger.debug(`Performance timing for ${label}:`, `${duration.toFixed(2)}ms`);
    
    return duration;
  }

  measureRender(componentName: string, fn: () => void): void {
    const timingId = this.startTiming(`render-${componentName}`);
    fn();
    this.endTiming(timingId);
  }

  observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              logger.warn('Long task detected:', {
                name: entry.name,
                duration: `${entry.duration.toFixed(2)}ms`,
                startTime: entry.startTime
              });
            }
          });
        });

        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (error) {
        logger.debug('Long task observation not supported');
      }
    }
  }

  observeLayoutShift(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.value > 0.1) { // CLS threshold
              logger.warn('Layout shift detected:', {
                value: entry.value,
                hadRecentInput: entry.hadRecentInput
              });
            }
          });
        });

        observer.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(observer);
      } catch (error) {
        logger.debug('Layout shift observation not supported');
      }
    }
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }

  getMemoryUsage(): any {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        totalJSHeapSize: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
        jsHeapSizeLimit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Utility functions for common performance optimizations
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number = PERFORMANCE_CONSTANTS.DEBOUNCE_DELAY
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number = PERFORMANCE_CONSTANTS.THROTTLE_DELAY
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

export const memoizeWithExpiry = <T>(
  func: (...args: any[]) => T,
  expiry: number = PERFORMANCE_CONSTANTS.CACHE_DURATION
): ((...args: any[]) => T) => {
  const cache = new Map<string, { value: T; timestamp: number }>();
  
  return (...args: any[]): T => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < expiry) {
      return cached.value;
    }
    
    const result = func(...args);
    cache.set(key, { value: result, timestamp: now });
    
    return result;
  };
};
