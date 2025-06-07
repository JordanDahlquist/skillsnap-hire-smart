
import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/services/loggerService';
import { performanceMonitor, PerformanceMonitor } from '@/utils/performanceUtils';
import { CleanupManager } from '@/utils/cleanupUtils';

export const useMemoryOptimization = (componentName: string) => {
  const cleanupManager = useRef(new CleanupManager());
  const performanceRef = useRef<PerformanceMonitor>(performanceMonitor);
  const renderCount = useRef(0);

  // Track render performance
  useEffect(() => {
    renderCount.current++;
    
    if (renderCount.current > 10) {
      logger.warn(`High render count detected for ${componentName}:`, renderCount.current);
    }

    // Monitor memory usage every 50 renders
    if (renderCount.current % 50 === 0) {
      const memoryUsage = performanceRef.current.getMemoryUsage();
      if (memoryUsage) {
        logger.debug(`Memory usage for ${componentName}:`, memoryUsage);
        
        if (memoryUsage.usedJSHeapSize > 50) { // Alert if using more than 50MB
          logger.warn(`High memory usage detected for ${componentName}:`, memoryUsage);
        }
      }
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      logger.debug(`Cleaning up resources for ${componentName}`);
      cleanupManager.current.cleanup();
    };
  }, [componentName]);

  const addCleanupFunction = useCallback((cleanupFn: () => void) => {
    cleanupManager.current.addCleanupFunction(cleanupFn);
  }, []);

  const addTimeout = useCallback((timeout: NodeJS.Timeout) => {
    cleanupManager.current.addTimeout(timeout);
  }, []);

  const addInterval = useCallback((interval: NodeJS.Timeout) => {
    cleanupManager.current.addInterval(interval);
  }, []);

  const measureOperation = useCallback((label: string, operation: () => void) => {
    performanceRef.current.measureRender(`${componentName}-${label}`, operation);
  }, [componentName]);

  return {
    addCleanupFunction,
    addTimeout,
    addInterval,
    measureOperation,
    renderCount: renderCount.current
  };
};

// Hook for optimizing expensive computations
export const useOptimizedComputation = <T>(
  computeFn: () => T,
  dependencies: React.DependencyList,
  label: string = 'computation'
): T => {
  const memoizedValue = useRef<T>();
  const lastDepsRef = useRef<React.DependencyList>();
  
  // Check if dependencies have changed
  const depsChanged = !lastDepsRef.current || 
    dependencies.some((dep, index) => dep !== lastDepsRef.current![index]);

  if (depsChanged) {
    const timingId = performanceMonitor.startTiming(label);
    memoizedValue.current = computeFn();
    const duration = performanceMonitor.endTiming(timingId);
    
    if (duration > 16) { // Longer than one frame (60fps)
      logger.warn(`Expensive computation detected: ${label}`, `${duration.toFixed(2)}ms`);
    }
    
    lastDepsRef.current = dependencies;
  }

  return memoizedValue.current!;
};
