import { useEffect, useRef, useCallback } from 'react';
import { productionLogger } from '@/services/productionLoggerService';
import { environment } from '@/config/environment';

interface PerformanceMetrics {
  renderTime: number;
  updateCount: number;
  averageRenderTime: number;
}

export const usePerformanceMonitoring = (componentName: string) => {
  const renderTimes = useRef<number[]>([]);
  const lastRenderTime = useRef<number>(0);
  const updateCount = useRef<number>(0);

  useEffect(() => {
    if (!environment.enablePerformanceMonitoring) return;

    const renderStart = performance.now();
    
    return () => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      renderTimes.current.push(renderTime);
      updateCount.current++;
      
      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }
      
      // Log slow renders
      if (renderTime > 16) { // Longer than one frame at 60fps
        productionLogger.warn(`Slow render detected: ${componentName}`, {
          component: componentName,
          action: 'SLOW_RENDER',
          metadata: { renderTime: `${renderTime.toFixed(2)}ms` }
        });
      }
      
      lastRenderTime.current = renderTime;
    };
  });

  const getMetrics = useCallback((): PerformanceMetrics => {
    const averageRenderTime = renderTimes.current.length > 0 
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length 
      : 0;

    return {
      renderTime: lastRenderTime.current,
      updateCount: updateCount.current,
      averageRenderTime
    };
  }, []);

  const measureOperation = useCallback(<T extends (...args: any[]) => any>(
    operation: T,
    operationName: string
  ): T => {
    return ((...args: any[]) => {
      if (!environment.enablePerformanceMonitoring) {
        return operation(...args);
      }

      const start = performance.now();
      const result = operation(...args);
      const duration = performance.now() - start;

      productionLogger.performance(`${componentName}.${operationName}`, duration);

      return result;
    }) as T;
  }, [componentName]);

  const measureAsyncOperation = useCallback(<T extends (...args: any[]) => Promise<any>>(
    operation: T,
    operationName: string
  ): T => {
    return (async (...args: any[]) => {
      if (!environment.enablePerformanceMonitoring) {
        return operation(...args);
      }

      const start = performance.now();
      try {
        const result = await operation(...args);
        const duration = performance.now() - start;
        productionLogger.performance(`${componentName}.${operationName}`, duration);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        productionLogger.performance(`${componentName}.${operationName} (failed)`, duration);
        throw error;
      }
    }) as T;
  }, [componentName]);

  return {
    getMetrics,
    measureOperation,
    measureAsyncOperation
  };
};
