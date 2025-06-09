
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PdfUploadProps {
  onFileUpload: (content: string, fileName: string) => void;
  onRemove: () => void;
  uploadedFile: string | null;
}

export const PdfUpload = ({ onFileUpload, onRemove, uploadedFile }: PdfUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
  };

  const processPdfFile = async (file: File) => {
    setIsProcessing(true);
    try {
      console.log('Processing PDF file:', file.name);
      
      // Create form data for the edge function
      const formData = new FormData();
      formData.append('pdf', file);
      
      // Call the edge function to extract text
      const { data, error } = await supabase.functions.invoke('parse-pdf-content', {
        body: formData
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to process PDF');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to extract text from PDF');
      }
      
      console.log('PDF processing successful, extracted text length:', data.text.length);
      
      // Call the callback with the extracted text
      onFileUpload(data.text, file.name);
      
      toast({
        title: "PDF uploaded successfully",
        description: `Extracted text from ${file.name}. You can now choose to keep it as-is or have AI rewrite it.`
      });
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Error processing PDF",
        description: error.message || "Please try again or enter the job description manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (uploadedFile) {
    return (
      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm">
        <div className="flex items-center gap-2">
          <FileText className="w-3 h-3 text-green-600" />
          <span className="text-green-800 font-medium">PDF content extracted successfully</span>
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
          <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-600"></div>
          <span className="text-xs text-gray-600">Extracting text from PDF...</span>
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
          >
            Choose File
          </Button>
        </div>
      )}
    </div>
  );
};
