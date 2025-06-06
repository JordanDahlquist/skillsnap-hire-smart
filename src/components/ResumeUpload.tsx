
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ParsedResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
  summary: string;
  totalExperience: string;
}

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
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    if (resumeFile) {
      processResumeFile(resumeFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document.",
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
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Extract text from file (simplified for demo - in production, use proper PDF/DOC parsing)
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          // For demo purposes, we'll simulate text extraction
          // In production, you'd use libraries like pdf-parse or mammoth for proper extraction
          const simulatedText = `
            John Doe
            Software Engineer
            john.doe@email.com
            (555) 123-4567
            San Francisco, CA
            
            EXPERIENCE
            Senior Software Engineer at TechCorp (2020-Present)
            - Led development of web applications using React and Node.js
            - Managed a team of 5 developers
            
            Software Engineer at StartupXYZ (2018-2020)
            - Built scalable APIs and microservices
            - Worked with AWS and Docker
            
            EDUCATION
            Bachelor of Science in Computer Science
            University of California, Berkeley (2018)
            
            SKILLS
            JavaScript, React, Node.js, Python, AWS, Docker, Git
          `;

          // Parse resume using AI
          const { data: parseResult } = await supabase.functions.invoke('parse-resume', {
            body: { resumeText: simulatedText }
          });

          if (parseResult?.parsedData) {
            onResumeData(parseResult.parsedData, filePath);
            toast({
              title: "Resume uploaded successfully",
              description: "Your information has been extracted and filled in the form.",
            });
          } else {
            throw new Error('Failed to parse resume');
          }
        } catch (error) {
          console.error('Error parsing resume:', error);
          toast({
            title: "Error parsing resume",
            description: "We couldn't extract information from your resume. Please fill the form manually.",
            variant: "destructive"
          });
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Error uploading resume",
        description: "Please try again or fill the form manually.",
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
              <span className="text-sm font-medium text-green-800">Resume uploaded and parsed successfully</span>
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
          <p className="text-xs text-green-600 mt-1">
            Your information has been automatically filled in the form below.
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
              <p className="text-sm text-gray-600">Processing resume...</p>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Upload your resume for auto-fill
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Drag and drop or click to select a PDF or Word document
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
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
