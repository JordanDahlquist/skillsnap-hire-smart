
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { Application } from "@/types";

interface CandidateDocumentsTabProps {
  application: Application;
}

export const CandidateDocumentsTab = ({ application }: CandidateDocumentsTabProps) => {
  const hasDocuments = !!(application.resume_file_path || application.cover_letter);

  if (!hasDocuments) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="text-lg font-medium text-muted-foreground mb-2">
            No Documents
          </div>
          <p className="text-sm text-muted-foreground">
            This candidate did not upload any documents.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resume */}
      {application.resume_file_path && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  View/Download
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cover Letter */}
      {application.cover_letter && (
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
