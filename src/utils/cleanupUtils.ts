
import { logger } from '@/services/loggerService';

export class CleanupManager {
  private cleanupFunctions: (() => void)[] = [];
  private timeouts: NodeJS.Timeout[] = [];
  private intervals: NodeJS.Timeout[] = [];
  private abortControllers: AbortController[] = [];

  addCleanupFunction(fn: () => void) {
    this.cleanupFunctions.push(fn);
  }

  addTimeout(timeout: NodeJS.Timeout) {
    this.timeouts.push(timeout);
  }

  addInterval(interval: NodeJS.Timeout) {
    this.intervals.push(interval);
  }

  addAbortController(controller: AbortController) {
    this.abortControllers.push(controller);
  }

  cleanup() {
    try {
      // Clear all timeouts
      this.timeouts.forEach(timeout => clearTimeout(timeout));
      this.timeouts = [];

      // Clear all intervals
      this.intervals.forEach(interval => clearInterval(interval));
      this.intervals = [];

      // Abort all pending requests
      this.abortControllers.forEach(controller => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      });
      this.abortControllers = [];

      // Run custom cleanup functions
      this.cleanupFunctions.forEach(fn => {
        try {
          fn();
        } catch (error) {
          logger.warn('Error in cleanup function:', error);
        }
      });
      this.cleanupFunctions = [];

      logger.debug('Cleanup completed successfully');
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }
}

export const useCleanup = () => {
  const cleanupManager = new CleanupManager();
  
  return {
    addCleanup: cleanupManager.addCleanupFunction.bind(cleanupManager),
    addTimeout: cleanupManager.addTimeout.bind(cleanupManager),
    addInterval: cleanupManager.addInterval.bind(cleanupManager),
    addAbortController: cleanupManager.addAbortController.bind(cleanupManager),
    cleanup: cleanupManager.cleanup.bind(cleanupManager)
  };
};
