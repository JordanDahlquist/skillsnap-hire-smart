
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, FileText, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reprocessResumeWithVisualAnalysis } from "@/utils/resumeUploadUtils";
import { supabase } from "@/integrations/supabase/client";
import type { Application } from "@/types";

interface BatchResumeReprocessorProps {
  applications: Application[];
  onProgress?: (processed: number, total: number) => void;
  onComplete?: () => void;
}

export const BatchResumeReprocessor = ({ 
  applications, 
  onProgress, 
  onComplete 
}: BatchResumeReprocessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; skipped: number }>({
    success: 0,
    failed: 0,
    skipped: 0
  });
  const { toast } = useToast();

  // Filter applications that have resume files but no parsed data
  const candidatesForProcessing = applications.filter(app => 
    app.resume_file_path && !app.parsed_resume_data
  );

  const candidatesWithData = applications.filter(app => 
    app.resume_file_path && app.parsed_resume_data
  );

  const handleBatchProcess = async () => {
    if (candidatesForProcessing.length === 0) {
      toast({
        title: "No candidates to process",
        description: "All candidates with resume files have already been processed.",
      });
      return;
    }

    setIsProcessing(true);
    setCurrentIndex(0);
    setResults({ success: 0, failed: 0, skipped: 0 });

    const newResults = { success: 0, failed: 0, skipped: 0 };

    for (let i = 0; i < candidatesForProcessing.length; i++) {
      const application = candidatesForProcessing[i];
      setCurrentIndex(i + 1);

      try {
        console.log(`Processing ${i + 1}/${candidatesForProcessing.length}: ${application.name}`);

        // Re-process the resume with visual analysis
        const parsedData = await reprocessResumeWithVisualAnalysis(application.resume_file_path!);

        if (parsedData) {
          // Update the application with the new parsed data (cast to any for Json compatibility)
          const { error: updateError } = await supabase
            .from('applications')
            .update({
              parsed_resume_data: parsedData as any,
              updated_at: new Date().toISOString()
            })
            .eq('id', application.id);

          if (updateError) {
            throw new Error(`Failed to update application: ${updateError.message}`);
          }

          newResults.success++;
          console.log(`✓ Successfully processed: ${application.name}`);
        } else {
          throw new Error('No data returned from resume processing');
        }

      } catch (error) {
        console.error(`✗ Failed to process ${application.name}:`, error);
        newResults.failed++;
      }

      setResults({ ...newResults });
      
      if (onProgress) {
        onProgress(i + 1, candidatesForProcessing.length);
      }

      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsProcessing(false);
    
    toast({
      title: "Batch processing complete",
      description: `Successfully processed ${newResults.success} resumes. ${newResults.failed} failed.`,
    });

    if (onComplete) {
      onComplete();
    }
  };

  const progress = candidatesForProcessing.length > 0 
    ? (currentIndex / candidatesForProcessing.length) * 100 
    : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Batch Resume Processor
          </CardTitle>
          <Badge variant="outline" className="text-blue-600">
            {applications.length} Total Applications
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{candidatesForProcessing.length}</div>
            <div className="text-sm text-muted-foreground">Need Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{candidatesWithData.length}</div>
            <div className="text-sm text-muted-foreground">Already Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {applications.length - candidatesForProcessing.length - candidatesWithData.length}
            </div>
            <div className="text-sm text-muted-foreground">No Resume File</div>
          </div>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing resumes...</span>
              <span>{currentIndex} / {candidatesForProcessing.length}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {(results.success > 0 || results.failed > 0) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">{results.success} successful</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm">{results.failed} failed</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleBatchProcess}
          disabled={candidatesForProcessing.length === 0 || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Processing {currentIndex} of {candidatesForProcessing.length}...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Process {candidatesForProcessing.length} Resumes
            </>
          )}
        </Button>

        {candidatesForProcessing.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            All candidates with resume files have already been processed with the new visual analysis system.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
