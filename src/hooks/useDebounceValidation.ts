
import { useCallback, useRef } from 'react';

export const useDebounceValidation = (validationFn: () => boolean, delay: number = 300) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedValidate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      validationFn();
    }, delay);
  }, [validationFn, delay]);

  const clearDebounce = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedValidate, clearDebounce };
};
