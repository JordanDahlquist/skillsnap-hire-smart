
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText, Upload, Link, Type, List } from "lucide-react";
import { SkillsQuestion } from "@/types/skillsAssessment";
import { SkillsTestQuestionInput } from "./SkillsTestQuestionInput";

interface SkillsTestQuestionCardProps {
  question: SkillsQuestion;
  index: number;
}

const getQuestionTypeIcon = (type: string) => {
  switch (type) {
    case 'file_upload':
      return Upload;
    case 'url_submission':
    case 'portfolio_link':
      return Link;
    case 'multiple_choice':
      return List;
    case 'text':
    case 'long_text':
    default:
      return Type;
  }
};

const getQuestionTypeLabel = (type: string) => {
  switch (type) {
    case 'text':
      return 'Text Response';
    case 'long_text':
      return 'Long Text Response';
    case 'file_upload':
      return 'File Upload';
    case 'url_submission':
      return 'URL Submission';
    case 'portfolio_link':
      return 'Portfolio Link';
    case 'video_upload':
      return 'Video Upload';
    case 'code_submission':
      return 'Code Submission';
    case 'multiple_choice':
      return 'Multiple Choice';
    default:
      return 'Text Response';
  }
};

export const SkillsTestQuestionCard = ({ question, index }: SkillsTestQuestionCardProps) => {
  const TypeIcon = getQuestionTypeIcon(question.type);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <span className="text-sm font-semibold text-blue-700">{index + 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <TypeIcon className="w-4 h-4 text-blue-600" />
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {getQuestionTypeLabel(question.type)}
              </Badge>
              {question.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
            {question.question}
          </h3>
        </div>

        {/* Instructions */}
        {question.candidateInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions</h4>
            <div className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
              {question.candidateInstructions}
            </div>
          </div>
        )}

        {/* Input Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Response Format</h4>
          <SkillsTestQuestionInput type={question.type} question={question} />
        </div>

        {/* Additional Guidelines */}
        {question.evaluationGuidelines && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">Evaluation Guidelines</h4>
            <div className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap">
              {question.evaluationGuidelines}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
