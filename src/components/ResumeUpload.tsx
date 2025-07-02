
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadResumeFile, ParsedResumeData } from "@/utils/resumeUploadUtils";

interface ResumeUploadProps {
  onResumeData: (data: ParsedResumeData, filePath: string) => void;
  onRemove: () => void;
  uploadedFile: string | null;
}

export const ResumeUpload = ({ onResumeData, onRemove, uploadedFile }: ResumeUploadProps) => {
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
    const resumeFile = files.find(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain'
    );
    
    if (resumeFile) {
      processResumeFile(resumeFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file.",
        variant: "destructive"
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processResumeFile(file);
    }
  };

  const processResumeFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await uploadResumeFile(file);
      
      if (result.parsedData) {
        onResumeData(result.parsedData, result.url);
        toast({
          title: "Resume uploaded successfully",
          description: "Your document has been processed and is ready for preview.",
        });
      } else {
        // Still pass the URL even if parsing failed
        onResumeData({
          personalInfo: { name: '', email: '', phone: '', location: '' },
          workExperience: [],
          education: [],
          skills: [],
          summary: '',
          totalExperience: ''
        }, result.url);
        
        toast({
          title: "Resume uploaded",
          description: "Document uploaded successfully. You can preview it and fill the form manually.",
        });
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Error uploading resume",
        description: error instanceof Error ? error.message : "Please try again or fill the form manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (uploadedFile) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Document uploaded successfully</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-black hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0 bg-white border border-gray-400 shadow-sm"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Your document is ready for preview and any extracted information has been filled in the form.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`border-2 border-dashed transition-colors ${
        isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-4">
        <div className="text-center">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Processing document...</p>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Upload your resume for auto-fill
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Drag and drop or click to select a PDF, Word, or text document
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('resume-upload')?.click()}
                className="h-8 px-3 text-sm"
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
