
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, FileText, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reprocessApplicationResume } from "@/utils/resumeReprocessingUtils";

interface ResumeProcessingDiagnosticProps {
  applicationId: string;
  resumeFilePath: string | null;
  parsedResumeData: any;
  onReprocessComplete: () => void;
}

export const ResumeProcessingDiagnostic = ({ 
  applicationId, 
  resumeFilePath, 
  parsedResumeData,
  onReprocessComplete 
}: ResumeProcessingDiagnosticProps) => {
  const [isReprocessing, setIsReprocessing] = useState(false);
  const { toast } = useToast();

  const handleReprocessResume = async () => {
    if (!resumeFilePath) {
      toast({
        title: "No resume file",
        description: "This application doesn't have a resume file to process.",
        variant: "destructive"
      });
      return;
    }

    setIsReprocessing(true);
    try {
      const result = await reprocessApplicationResume(applicationId);
      
      if (result.success) {
        toast({
          title: "Resume reprocessed successfully",
          description: "The resume has been re-parsed and the application updated.",
        });
        onReprocessComplete();
      } else {
        toast({
          title: "Resume reprocessing failed",
          description: result.error || "Failed to reprocess resume",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error reprocessing resume:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during reprocessing.",
        variant: "destructive"
      });
    } finally {
      setIsReprocessing(false);
    }
  };

  const getResumeStatus = () => {
    if (!resumeFilePath) {
      return { status: 'none', message: 'No resume uploaded', icon: AlertCircle, color: 'text-gray-500' };
    }
    
    if (parsedResumeData) {
      return { status: 'success', message: 'Resume parsed successfully', icon: CheckCircle, color: 'text-green-600' };
    }
    
    return { status: 'failed', message: 'Resume parsing failed', icon: AlertCircle, color: 'text-red-600' };
  };

  const status = getResumeStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Resume Processing Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${status.color}`} />
          <span className={status.color}>{status.message}</span>
        </div>
        
        {resumeFilePath && (
          <div className="text-sm text-gray-600">
            <p><strong>File:</strong> {resumeFilePath}</p>
          </div>
        )}
        
        {parsedResumeData && (
          <div className="text-sm text-gray-600">
            <p><strong>Parsed data available:</strong></p>
            <ul className="list-disc ml-4 mt-1">
              {parsedResumeData.personalInfo?.name && <li>Name: {parsedResumeData.personalInfo.name}</li>}
              {parsedResumeData.personalInfo?.email && <li>Email: {parsedResumeData.personalInfo.email}</li>}
              {parsedResumeData.workExperience?.length > 0 && (
                <li>Work Experience: {parsedResumeData.workExperience.length} entries</li>
              )}
              {parsedResumeData.education?.length > 0 && (
                <li>Education: {parsedResumeData.education.length} entries</li>
              )}
              {parsedResumeData.skills?.length > 0 && (
                <li>Skills: {parsedResumeData.skills.length} items</li>
              )}
            </ul>
          </div>
        )}
        
        {resumeFilePath && (
          <Button 
            onClick={handleReprocessResume}
            disabled={isReprocessing}
            variant="outline"
            className="w-full"
          >
            {isReprocessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Reprocessing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reprocess Resume
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
