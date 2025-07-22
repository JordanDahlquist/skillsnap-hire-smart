
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reprocessResumeWithEdenAI, updateApplicationWithResumeData } from "@/utils/resumeUploadUtils";
import type { Application } from "@/types";

interface ResumeReprocessorProps {
  application: Application;
  onSuccess?: () => void;
}

export const ResumeReprocessor = ({ application, onSuccess }: ResumeReprocessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const hasResumeFile = Boolean(application.resume_file_path);
  const hasParsedData = Boolean(application.parsed_resume_data);

  const handleReprocess = async () => {
    if (!application.resume_file_path) {
      toast({
        title: "No resume file",
        description: "This application doesn't have a resume file to process.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('processing');

    try {
      console.log('Re-processing resume for application:', application.id, 'Resume URL:', application.resume_file_path);
      
      // Re-process the resume with Eden AI
      const { parsedData, aiRating, summary } = await reprocessResumeWithEdenAI(application.resume_file_path);
      
      if (!parsedData) {
        throw new Error('No data returned from Eden AI processing');
      }

      console.log('Resume re-processing completed, saving to database:', {
        applicationId: application.id,
        hasPersonalInfo: !!parsedData?.personalInfo,
        workExperienceCount: parsedData?.workExperience?.length || 0,
        skillsCount: parsedData?.skills?.length || 0,
        aiRating,
        summaryLength: summary?.length || 0
      });

      // CRITICAL FIX: Use the new utility function to properly save to database
      await updateApplicationWithResumeData(application.id, parsedData, aiRating, summary);

      setProcessingStatus('success');
      toast({
        title: "Resume processed successfully",
        description: "The resume has been re-analyzed with Eden AI and saved to the database.",
      });

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error re-processing resume:', error);
      setProcessingStatus('error');
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process resume",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (processingStatus) {
      case 'processing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = () => {
    if (!hasResumeFile) {
      return <Badge variant="outline" className="text-gray-500">No Resume File</Badge>;
    }
    
    if (hasParsedData) {
      return <Badge variant="outline" className="text-green-600">Data Available</Badge>;
    }
    
    return <Badge variant="outline" className="text-yellow-600">Needs Processing</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Resume Processing</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm text-muted-foreground">
            {processingStatus === 'processing' && "Processing resume with AI and saving to database..."}
            {processingStatus === 'success' && "Resume processed and saved successfully"}
            {processingStatus === 'error' && "Processing failed"}
            {processingStatus === 'idle' && (hasParsedData ? "Resume data available in database" : "Ready to process and save")}
          </span>
        </div>

        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Resume File:</span> {hasResumeFile ? "Available" : "Not uploaded"}
          </div>
          <div className="text-sm">
            <span className="font-medium">Parsed Data:</span> {hasParsedData ? "Saved in database" : "Not processed"}
          </div>
          {hasParsedData && application.parsed_resume_data && (
            <div className="text-xs text-muted-foreground">
              Last processed: {new Date(application.updated_at).toLocaleString()}
            </div>
          )}
        </div>

        <Button
          onClick={handleReprocess}
          disabled={!hasResumeFile || isProcessing}
          className="w-full"
          variant={hasParsedData ? "outline" : "default"}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Processing & Saving...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {hasParsedData ? "Re-process Resume" : "Process Resume"}
            </>
          )}
        </Button>

        {!hasResumeFile && (
          <p className="text-sm text-muted-foreground">
            This application doesn't have a resume file. The candidate may have filled out the form manually.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
