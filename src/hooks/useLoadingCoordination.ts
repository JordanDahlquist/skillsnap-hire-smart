
import { useState, useCallback, useRef } from 'react';
import { logger } from '@/services/loggerService';

interface LoadingOperation {
  id: string;
  description: string;
  startTime: number;
}

export const useLoadingCoordination = () => {
  const [operations, setOperations] = useState<LoadingOperation[]>([]);
  const operationIdRef = useRef(0);

  const startOperation = useCallback((description: string): string => {
    const id = `op_${++operationIdRef.current}`;
    const operation: LoadingOperation = {
      id,
      description,
      startTime: Date.now()
    };

    setOperations(prev => [...prev, operation]);
    logger.debug(`Loading operation started: ${description}`, { id });
    
    return id;
  }, []);

  const endOperation = useCallback((id: string) => {
    setOperations(prev => {
      const operation = prev.find(op => op.id === id);
      if (operation) {
        const duration = Date.now() - operation.startTime;
        logger.debug(`Loading operation completed: ${operation.description}`, { 
          id, 
          duration: `${duration}ms` 
        });
      }
      return prev.filter(op => op.id !== id);
    });
  }, []);

  const isLoading = operations.length > 0;
  const currentOperations = operations.map(op => op.description);

  return {
    isLoading,
    currentOperations,
    startOperation,
    endOperation
  };
};
