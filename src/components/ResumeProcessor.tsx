
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reprocessResumeWithEdenAI } from "@/utils/resumeUploadUtils";
import { supabase } from "@/integrations/supabase/client";
import type { Application } from "@/types";

interface ResumeProcessorProps {
  application: Application;
  onSuccess?: () => void;
  batchMode?: boolean;
}

export const ResumeProcessor = ({ application, onSuccess, batchMode }: ResumeProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const hasResumeFile = Boolean(application.resume_file_path);
  const hasParsedData = Boolean(application.parsed_resume_data);

  const handleProcess = async () => {
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
      // Process the resume with Eden AI
      const { parsedData, aiRating, summary } = await reprocessResumeWithEdenAI(application.resume_file_path);
      
      // Update the application with parsed data
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          parsed_resume_data: parsedData,
          ai_rating: aiRating,
          ai_summary: summary,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (updateError) {
        throw new Error(`Failed to update application: ${updateError.message}`);
      }

      setProcessingStatus('success');
      toast({
        title: "Resume processed successfully",
        description: "The resume has been analyzed with AI.",
      });

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error processing resume:', error);
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

  if (!batchMode) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Resume Processing</CardTitle>
            <Badge variant="outline" className={
              !hasResumeFile ? "text-gray-500" :
              hasParsedData ? "text-green-600" :
              "text-yellow-600"
            }>
              {!hasResumeFile ? "No Resume" :
               hasParsedData ? "Processed" :
               "Needs Processing"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleProcess}
            disabled={!hasResumeFile || isProcessing}
            className="w-full"
            variant={hasParsedData ? "outline" : "default"}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {hasParsedData ? "Re-process Resume" : "Process Resume"}
              </>
            )}
          </Button>

          {processingStatus !== 'idle' && (
            <div className="text-sm text-muted-foreground">
              {processingStatus === 'processing' && "Processing resume with AI..."}
              {processingStatus === 'success' && "Resume processed successfully"}
              {processingStatus === 'error' && "Processing failed"}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Batch mode display
  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
      <FileText className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium">{application.name}</span>
      <div className="ml-auto flex items-center gap-2">
        {processingStatus === 'processing' && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
        {processingStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
        {processingStatus === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
      </div>
    </div>
  );
};
