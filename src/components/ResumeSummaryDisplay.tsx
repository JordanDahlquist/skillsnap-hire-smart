import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, User } from "lucide-react";

interface ResumeSummaryDisplayProps {
  resumeSummary?: string;
  applicantName: string;
  className?: string;
}

export const ResumeSummaryDisplay = ({ resumeSummary, applicantName, className }: ResumeSummaryDisplayProps) => {
  if (!resumeSummary) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resume Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            No resume summary available. Upload a PDF resume to generate an AI summary.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resume Summary
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <User className="w-3 h-3" />
            AI Generated
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {resumeSummary}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};