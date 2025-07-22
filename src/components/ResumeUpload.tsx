
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, X, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadResumeFile, updateApplicationWithResumeData, ParsedResumeData } from "@/utils/resumeUploadUtils";

interface ResumeUploadProps {
  onResumeData: (data: ParsedResumeData, filePath: string) => void;
  onRemove: () => void;
  uploadedFile: string | null;
  applicationId?: string; // Add applicationId prop for database updates
}

export const ResumeUpload = ({ onResumeData, onRemove, uploadedFile, applicationId }: ResumeUploadProps) => {
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
      console.log('Starting resume file processing:', file.name);
      
      const result = await uploadResumeFile(file);
      console.log('Resume upload result:', {
        hasUrl: !!result.url,
        hasParsedData: !!result.parsedData,
        hasAiRating: !!result.aiRating,
        hasSummary: !!result.summary
      });
      
      if (result.parsedData) {
        // CRITICAL FIX: Save parsed data to database if applicationId is provided
        if (applicationId) {
          try {
            console.log('Saving parsed resume data to database for application:', applicationId);
            await updateApplicationWithResumeData(
              applicationId, 
              result.parsedData, 
              result.aiRating, 
              result.summary
            );
            console.log('Successfully saved parsed resume data to database');
          } catch (saveError) {
            console.error('Failed to save parsed data to database:', saveError);
            // Don't fail the entire process if database save fails
            toast({
              title: "Warning",
              description: "Resume was processed but failed to save to database. You may need to re-process later.",
              variant: "destructive"
            });
          }
        } else {
          console.warn('No applicationId provided - cannot save parsed data to database');
        }

        onResumeData(result.parsedData, result.url);
        toast({
          title: "Resume processed successfully",
          description: "Your resume has been analyzed using advanced visual AI and saved to the database.",
        });
      } else {
        // Still pass the URL even if parsing failed
        onResumeData({
          personalInfo: { name: '', email: '', phone: '', location: '' },
          workExperience: [],
          education: [],
          skills: []
        }, result.url);
        
        toast({
          title: "Resume uploaded",
          description: file.type === 'application/pdf' 
            ? "PDF uploaded successfully. Visual analysis may have encountered issues. You can re-process it later or fill the form manually."
            : "Document uploaded successfully. You can preview it and fill the form manually.",
        });
      }
    } catch (error) {
      console.error('Error uploading/processing resume:', error);
      toast({
        title: "Error processing resume",
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
              <span className="text-sm font-medium text-green-800">Resume processed with visual AI</span>
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
            Your resume has been analyzed using advanced visual AI technology and saved to the database.
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
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Analyzing resume with visual AI...</p>
              <p className="text-xs text-gray-500">Processing and saving to database...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Upload className="w-6 h-6 text-gray-400" />
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Upload your resume for AI analysis
              </p>
              <p className="text-xs text-gray-500 mb-1">
                Now powered by advanced visual AI with database persistence
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
