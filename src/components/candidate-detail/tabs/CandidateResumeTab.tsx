
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { Application } from "@/types";

interface CandidateResumeTabProps {
  application: Application;
}

export const CandidateResumeTab = ({ application }: CandidateResumeTabProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="space-y-6">
      {/* Resume Section */}
      {hasResume && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Download Section */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Resume.pdf</p>
                  <p className="text-sm text-muted-foreground">Candidate's resume</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                asChild
                className="flex items-center gap-2"
              >
                <a 
                  href={application.resume_file_path} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </Button>
            </div>

            {/* PDF Preview Section */}
            <div className="relative">
              <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
                {isLoading && (
                  <div className="flex items-center justify-center h-96 bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading resume preview...
                    </div>
                  </div>
                )}
                
                {hasError ? (
                  <div className="flex items-center justify-center h-96 bg-muted/50">
                    <div className="text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Unable to preview this file</p>
                      <p className="text-xs mt-1">Please use the download button above</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={`${application.resume_file_path}#toolbar=0&navpanes=0&scrollbar=0`}
                    className={`w-full h-96 border-0 ${isLoading ? 'hidden' : 'block'}`}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    title="Resume Preview"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cover Letter Section */}
      {hasCoverLetter && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/30 rounded-lg border border-border max-h-96 overflow-y-auto">
              <p className="text-foreground whitespace-pre-wrap">{application.cover_letter}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
