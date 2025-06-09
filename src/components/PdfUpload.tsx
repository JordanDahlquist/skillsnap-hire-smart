
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X, AlertCircle, Brain, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PdfUploadProps {
  onFileUpload: (content: string, fileName: string) => void;
  onRemove: () => void;
  uploadedFile: string | null;
}

export const PdfUpload = ({ onFileUpload, onRemove, uploadedFile }: PdfUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      processPdfFile(pdfFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive"
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      processPdfFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive"
      });
    }
    // Reset input
    e.target.value = '';
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }
    
    if (file.size === 0) {
      return { valid: false, error: 'File appears to be empty' };
    }
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: 'File must have a .pdf extension' };
    }
    
    return { valid: true };
  };

  const processPdfFile = async (file: File, isRetry = false) => {
    // Clear previous errors
    setLastError(null);
    
    // Validate file before processing
    const validation = validateFile(file);
    if (!validation.valid) {
      setLastError(validation.error!);
      toast({
        title: "File validation failed",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Processing PDF file:', file.name, 'Size:', file.size, 'bytes');
      
      // Create form data for the AI-powered edge function
      const formData = new FormData();
      formData.append('pdf', file);
      
      // Call the enhanced AI-powered edge function
      const { data, error } = await supabase.functions.invoke('ai-pdf-reader', {
        body: formData
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to process PDF');
      }
      
      if (!data || !data.success) {
        const errorMessage = data?.error || 'Failed to extract text from PDF';
        const errorCode = data?.errorCode || 'UNKNOWN_ERROR';
        
        console.error('PDF processing failed:', {
          error: errorMessage,
          code: errorCode,
          data
        });
        
        // Provide specific error messages based on error code
        let userMessage = errorMessage;
        let suggestions: string[] = [];
        
        switch (errorCode) {
          case 'VALIDATION_ERROR':
            suggestions = ['Check that your file is a valid PDF', 'Try a smaller file (under 10MB)'];
            break;
          case 'EXTRACTION_ERROR':
            suggestions = [
              'The PDF may be image-based (scanned document)',
              'Try a text-based PDF instead',
              'Consider copying and pasting the text manually'
            ];
            break;
          case 'INSUFFICIENT_TEXT':
            suggestions = [
              'The PDF may contain mostly images',
              'Try a different PDF with more text content',
              'Consider manually entering the job description'
            ];
            break;
          default:
            suggestions = ['Try a different PDF file', 'Check your internet connection'];
        }
        
        setLastError(`${userMessage}${suggestions.length > 0 ? '\n\nSuggestions:\n• ' + suggestions.join('\n• ') : ''}`);
        throw new Error(userMessage);
      }
      
      console.log('PDF processing successful:', {
        textLength: data.text.length,
        fileName: data.fileName,
        method: data.method
      });
      
      // Reset retry count on success
      setRetryCount(0);
      setLastError(null);
      
      // Call the callback with the extracted text
      onFileUpload(data.text, file.name);
      
      toast({
        title: "PDF processed successfully",
        description: `Extracted ${data.text.length} characters from ${file.name}. You can now choose to keep it as-is or have AI rewrite it.`,
        duration: 5000
      });
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (!isRetry && retryCount < 2) {
        // Allow up to 2 retries for transient errors
        setRetryCount(prev => prev + 1);
        toast({
          title: "Processing failed, retrying...",
          description: `Attempt ${retryCount + 2} of 3`,
          variant: "destructive"
        });
        
        // Retry after a short delay
        setTimeout(() => {
          processPdfFile(file, true);
        }, 2000);
        return;
      }
      
      setLastError(errorMessage);
      toast({
        title: "Error processing PDF",
        description: errorMessage + ". Please try a different PDF or enter the job description manually.",
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setLastError(null);
    // Trigger file selection again
    document.getElementById('pdf-upload')?.click();
  };

  if (uploadedFile) {
    return (
      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm">
        <div className="flex items-center gap-2">
          <Brain className="w-3 h-3 text-green-600" />
          <span className="text-green-800 font-medium">PDF content extracted with AI</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-green-600 hover:text-green-800 h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div 
        className={`border border-dashed rounded p-2 transition-colors text-center ${
          isDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <Brain className="w-3 h-3 text-purple-600 animate-pulse" />
            <span className="text-xs text-gray-600">
              AI is reading your PDF{retryCount > 0 ? ` (attempt ${retryCount + 1})` : ''}...
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Upload className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600">Upload existing job description (PDF)</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('pdf-upload')?.click()}
              className="h-6 px-2 text-xs"
              disabled={isProcessing}
            >
              Choose File
            </Button>
          </div>
        )}
      </div>

      {lastError && (
        <Alert variant="destructive" className="text-xs">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">
            <div className="whitespace-pre-line">{lastError}</div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Again
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLastError(null)}
                className="h-6 px-2 text-xs"
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
