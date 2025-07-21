
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { batchReprocessResumes, showReprocessingResults } from "@/utils/resumeReprocessingUtils";

interface BatchResumeProcessorProps {
  jobId?: string;
  onComplete?: () => void;
}

export const BatchResumeProcessor = ({ jobId, onComplete }: BatchResumeProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const { toast } = useToast();

  const handleBatchReprocess = async () => {
    setIsProcessing(true);
    setProgress(0);
    setStatus('Starting batch reprocessing...');

    try {
      const result = await batchReprocessResumes(jobId);
      
      setProgress(100);
      setStatus(`Completed: ${result.successful}/${result.processed} successful`);
      
      showReprocessingResults(result);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Batch reprocessing failed:', error);
      toast({
        title: "Batch processing failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      setStatus('Failed to complete batch processing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Batch Resume Reprocessing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AlertCircle className="w-4 h-4" />
          <span>This will reprocess all resumes with failed parsing {jobId ? 'for this job' : 'across all jobs'}</span>
        </div>
        
        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">{status}</p>
          </div>
        )}
        
        <Button 
          onClick={handleBatchReprocess}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reprocess All Failed Resumes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
