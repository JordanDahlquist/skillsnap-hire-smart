
import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/services/loggerService';

export const useMemoryOptimization = () => {
  const observersRef = useRef<IntersectionObserver[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);
  const listenersRef = useRef<Array<{ element: Element; type: string; listener: EventListener }>>([]);

  const addObserver = useCallback((observer: IntersectionObserver) => {
    observersRef.current.push(observer);
  }, []);

  const addTimeout = useCallback((timeout: NodeJS.Timeout) => {
    timeoutsRef.current.push(timeout);
  }, []);

  const addInterval = useCallback((interval: NodeJS.Timeout) => {
    intervalsRef.current.push(interval);
  }, []);

  const addEventListener = useCallback((element: Element, type: string, listener: EventListener) => {
    element.addEventListener(type, listener);
    listenersRef.current.push({ element, type, listener });
  }, []);

  const cleanup = useCallback(() => {
    // Disconnect observers
    observersRef.current.forEach(observer => observer.disconnect());
    observersRef.current = [];

    // Clear timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];

    // Clear intervals
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current = [];

    // Remove event listeners
    listenersRef.current.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
    listenersRef.current = [];

    logger.debug('Memory optimization cleanup completed');
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    addObserver,
    addTimeout,
    addInterval,
    addEventListener,
    cleanup
  };
};
