
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface VideoUploadErrorHandlerProps {
  error: string | null;
  onRetry: () => void;
  isRetrying: boolean;
}

export const VideoUploadErrorHandler = ({ 
  error, 
  onRetry, 
  isRetrying 
}: VideoUploadErrorHandlerProps) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="ml-4"
        >
          {isRetrying ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            'Retry Upload'
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
