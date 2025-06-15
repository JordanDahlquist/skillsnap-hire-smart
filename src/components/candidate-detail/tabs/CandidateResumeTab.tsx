
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Application } from "@/types";
import { constructResumeUrl } from "@/utils/resumeUploadUtils";
import { EnhancedDocumentViewer } from "./EnhancedDocumentViewer";

interface CandidateResumeTabProps {
  application: Application;
}

export const CandidateResumeTab = ({ application }: CandidateResumeTabProps) => {
  const hasResume = !!(application.resume_file_path);
  const hasCoverLetter = !!(application.cover_letter);

  if (!hasResume && !hasCoverLetter) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="text-lg font-medium text-muted-foreground mb-2">
            No Resume or Documents
          </div>
          <p className="text-sm text-muted-foreground">
            This candidate did not upload a resume or cover letter.
          </p>
        </CardContent>
      </Card>
    );
  }

  const resumeUrl = hasResume ? constructResumeUrl(application.resume_file_path) : '';
  
  // Determine file type from file path
  const getFileType = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    return extension || 'pdf';
  };

  return (
    <div className="space-y-6">
      {/* Resume Section */}
      {hasResume && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-left">
              <FileText className="w-5 h-5" />
              Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedDocumentViewer 
              documentUrl={resumeUrl}
              fileName="Resume"
              fileType={getFileType(application.resume_file_path)}
            />
          </CardContent>
        </Card>
      )}

      {/* Cover Letter Section */}
      {hasCoverLetter && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-left">Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/30 rounded-lg border border-border max-h-96 overflow-y-auto">
              <p className="text-foreground whitespace-pre-wrap text-left">{application.cover_letter}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
