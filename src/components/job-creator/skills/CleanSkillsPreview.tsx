
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { SkillsTestData } from "@/types/skillsAssessment";
import { parseMarkdown } from "@/utils/markdownParser";

interface CleanSkillsPreviewProps {
  skillsTestData: SkillsTestData;
  onBack: () => void;
  jobTitle?: string;
}

export const CleanSkillsPreview = ({ 
  skillsTestData, 
  onBack,
  jobTitle = "Position"
}: CleanSkillsPreviewProps) => {
  const estimatedTime = skillsTestData.questions.length * 5; // 5 minutes per challenge

  const getResponseTypeIcon = (type: string) => {
    switch (type) {
      case 'video_upload':
        return '🎥';
      case 'file_upload':
        return '📁';
      case 'code_submission':
        return '💻';
      case 'url_submission':
        return '🔗';
      case 'multiple_choice':
        return '🔘';
      default:
        return '✍️';
    }
  };

  const getResponseTypeLabel = (type: string) => {
    const labels = {
      text: "Text Response",
      long_text: "Long Text Response",
      video_upload: "Video Upload",
      file_upload: "File Upload",
      code_submission: "Code Submission",
      url_submission: "URL Submission",
      multiple_choice: "Multiple Choice"
    };
    return labels[type as keyof typeof labels] || "Text Response";
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Editor
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              ~{estimatedTime} min
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {skillsTestData.questions.length} challenge{skillsTestData.questions.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {jobTitle} Skills Assessment Challenge
            </h1>
            <p className="text-gray-600">
              Complete the following challenges to demonstrate your skills
            </p>
          </div>

          {/* Challenges */}
          <div className="space-y-6">
            {skillsTestData.questions.map((challenge, index) => (
              <Card key={challenge.id} className="border border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {challenge.question}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{getResponseTypeIcon(challenge.type)}</span>
                        <span>{getResponseTypeLabel(challenge.type)}</span>
                        {challenge.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {challenge.candidateInstructions ? (
                    <div 
                      className="prose prose-sm max-w-none 
                        prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mb-2 prose-headings:mt-3
                        prose-p:mb-3 prose-p:leading-relaxed prose-p:text-gray-700
                        prose-ul:mb-4 prose-ul:space-y-2 prose-li:mb-2 prose-li:text-gray-700 prose-li:leading-relaxed
                        prose-ol:mb-4 prose-ol:space-y-2 prose-li:mb-2 prose-li:text-gray-700 prose-li:leading-relaxed
                        prose-strong:text-gray-900 prose-strong:font-semibold
                        prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(challenge.candidateInstructions) }} 
                    />
                  ) : (
                    <p className="text-gray-500 italic">No instructions provided for this challenge.</p>
                  )}

                  {/* Mock Response Area */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-sm text-gray-600 text-center">
                      {challenge.type === 'video_upload' && 'Video upload area'}
                      {challenge.type === 'file_upload' && 'File upload area'}
                      {challenge.type === 'code_submission' && 'Code editor area'}
                      {challenge.type === 'url_submission' && 'URL input field'}
                      {challenge.type === 'multiple_choice' && 'Multiple choice options area'}
                      {(challenge.type === 'text' || challenge.type === 'long_text') && 'Text response area'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Section */}
          <div className="text-center py-6 border-t border-gray-200">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3" disabled>
              Submit Assessment
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Preview mode - submission disabled
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
