
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X, AlertCircle, Brain, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PdfUploadProps {
  onFileUpload: (content: string, fileName: string) => void;
  onRemove: () => void;
  uploadedFile: string | null;
}

export const PdfUpload = ({ onFileUpload, onRemove, uploadedFile }: PdfUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [errorSuggestions, setErrorSuggestions] = useState<string[]>([]);
  const [extractedPreview, setExtractedPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingContent, setPendingContent] = useState<{ content: string; fileName: string } | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState("");
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

  const processPdfFile = async (file: File) => {
    // Clear previous states
    setLastError(null);
    setErrorSuggestions([]);
    setExtractedPreview(null);
    setPendingContent(null);
    setShowPreview(false);
    setShowManualInput(false);
    
    setIsProcessing(true);
    
    try {
      console.log('Processing PDF file:', file.name, 'Size:', file.size, 'bytes');
      
      const formData = new FormData();
      formData.append('pdf', file);
      
      const { data, error } = await supabase.functions.invoke('ai-pdf-reader', {
        body: formData
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to process PDF');
      }
      
      if (!data || !data.success) {
        const errorMessage = data?.error || 'Failed to extract text from PDF';
        const suggestions = data?.suggestions || [];
        
        console.error('PDF processing failed:', errorMessage);
        setLastError(errorMessage);
        setErrorSuggestions(suggestions);
        
        toast({
          title: "PDF processing failed",
          description: errorMessage,
          variant: "destructive",
          duration: 6000
        });
        return;
      }
      
      console.log('PDF processing successful:', {
        textLength: data.text.length,
        fileName: data.fileName
      });
      
      setExtractedPreview(data.text);
      setPendingContent({ content: data.text, fileName: file.name });
      setShowPreview(true);
      
      toast({
        title: "PDF text extracted successfully!",
        description: `Extracted ${data.text.length} characters. Please review below.`,
        duration: 5000
      });
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setLastError(errorMessage);
      setErrorSuggestions(['Try a different PDF file', 'Use manual input below']);
      
      toast({
        title: "Error processing PDF",
        description: errorMessage,
        variant: "destructive",
        duration: 6000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptExtracted = () => {
    if (pendingContent) {
      onFileUpload(pendingContent.content, pendingContent.fileName);
      setExtractedPreview(null);
      setPendingContent(null);
      setShowPreview(false);
      setLastError(null);
      setErrorSuggestions([]);
    }
  };

  const handleRejectExtracted = () => {
    setExtractedPreview(null);
    setPendingContent(null);
    setShowPreview(false);
    setShowManualInput(true);
  };

  const handleManualSubmit = () => {
    if (manualText.trim().length > 10) {
      onFileUpload(manualText.trim(), "Manual Input");
      setManualText("");
      setShowManualInput(false);
      setLastError(null);
      setErrorSuggestions([]);
      toast({
        title: "Manual text added",
        description: "Your job description has been added successfully."
      });
    } else {
      toast({
        title: "Text too short",
        description: "Please enter at least 10 characters.",
        variant: "destructive"
      });
    }
  };

  const handleTryAgain = () => {
    setLastError(null);
    setErrorSuggestions([]);
    setShowManualInput(false);
    document.getElementById('pdf-upload')?.click();
  };

  // Show manual input form
  if (showManualInput) {
    return (
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <Label className="text-sm font-medium text-blue-800 mb-2 block">
            Manual Job Description Input
          </Label>
          <Textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Paste or type your job description here..."
            rows={6}
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleManualSubmit}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={manualText.trim().length < 10}
            >
              Use This Text
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowManualInput(false)}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show extracted content for review
  if (extractedPreview && pendingContent) {
    return (
      <div className="space-y-3">
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Text Extracted Successfully!</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-green-600 hover:text-green-800 h-6 px-2"
            >
              {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showPreview ? 'Hide' : 'Preview'}
            </Button>
          </div>
          
          {showPreview && (
            <div className="mb-3 p-2 bg-white border rounded text-xs max-h-40 overflow-y-auto">
              <div className="whitespace-pre-wrap">
                {extractedPreview.substring(0, 800)}
                {extractedPreview.length > 800 && '...'}
              </div>
              <div className="text-gray-500 text-xs mt-2">
                Total length: {extractedPreview.length} characters
              </div>
            </div>
          )}
          
          <p className="text-xs text-green-700 mb-2">
            Does this text look correct?
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={handleAcceptExtracted}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white h-7 px-3 text-xs"
            >
              Accept & Use This Text
            </Button>
            <Button
              variant="outline"
              onClick={handleRejectExtracted}
              size="sm"
              className="h-7 px-3 text-xs"
            >
              Enter Manually Instead
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (uploadedFile) {
    return (
      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm">
        <div className="flex items-center gap-2">
          <FileText className="w-3 h-3 text-green-600" />
          <span className="text-green-800 font-medium">Content ready for use</span>
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
        className={`border border-dashed rounded p-3 transition-colors text-center ${
          isDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
            <span className="text-sm text-gray-600">Processing PDF...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Upload job description (PDF)</span>
            </div>
            <div className="flex gap-2 justify-center">
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
                className="h-7 px-3 text-xs"
                disabled={isProcessing}
              >
                Choose PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManualInput(true)}
                className="h-7 px-3 text-xs text-blue-600 hover:text-blue-800"
              >
                Enter Manually
              </Button>
            </div>
          </div>
        )}
      </div>

      {lastError && (
        <Alert variant="destructive" className="text-xs">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">
            <div className="mb-2">{lastError}</div>
            {errorSuggestions.length > 0 && (
              <div className="mb-2">
                <strong>Suggestions:</strong>
                <ul className="list-disc list-inside mt-1">
                  {errorSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTryAgain}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Different PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManualInput(true)}
                className="h-6 px-2 text-xs text-blue-600"
              >
                Enter Manually
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
