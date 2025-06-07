
import { useToast } from "@/components/ui/use-toast";
import { useCallback } from "react";

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((error: Error | unknown, message?: string) => {
    console.error('Error occurred:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    toast({
      title: "Error",
      description: message || errorMessage,
      variant: "destructive",
    });
  }, [toast]);

  return { handleError };
};
