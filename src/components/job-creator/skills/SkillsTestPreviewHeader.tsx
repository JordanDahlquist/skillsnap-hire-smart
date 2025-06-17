
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, FileText } from "lucide-react";

interface SkillsTestPreviewHeaderProps {
  onBack: () => void;
  estimatedTime: number;
  questionCount: number;
}

export const SkillsTestPreviewHeader = ({ 
  onBack, 
  estimatedTime, 
  questionCount 
}: SkillsTestPreviewHeaderProps) => {
  return (
    <CardHeader className="pb-3 flex-shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="p-1 h-8 w-8"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <CardTitle className="text-lg">Assessment Preview</CardTitle>
        <Badge variant="outline" className="text-xs">
          Candidate View
        </Badge>
      </div>
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Skills Assessment</h1>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>~{estimatedTime} minutes</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{questionCount} questions</span>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};
