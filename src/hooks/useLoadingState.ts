
import { useState, useCallback } from "react";

export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

  const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      console.error('Error in withLoading:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    setIsLoading,
    withLoading
  };
};
