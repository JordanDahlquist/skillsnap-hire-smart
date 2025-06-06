
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      // For now, we'll simulate PDF processing
      // In a real implementation, you'd use a library like pdf-parse or send to an edge function
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate extracted text - in reality this would be parsed from PDF
        const simulatedContent = `Job Description from ${file.name}\n\nThis content would be extracted from the PDF file. For demo purposes, this represents the text content that would be parsed from the uploaded PDF document.`;
        onFileUpload(simulatedContent, file.name);
        toast({
          title: "PDF uploaded successfully",
          description: `${file.name} has been processed.`
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Error processing PDF",
        description: "Please try again or enter the job description manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (uploadedFile) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">PDF uploaded successfully</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-green-600 mt-1">
            The AI will use this as the basis for generating your job post.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`border-2 border-dashed transition-colors ${
        isDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-6">
        <div className="text-center">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-sm text-gray-600">Processing PDF...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Upload existing job description (PDF)
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Drag and drop or click to select a PDF file
              </p>
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
              >
                Choose File
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
