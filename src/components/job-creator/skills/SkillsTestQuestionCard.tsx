
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Video, Link, Code, Upload } from "lucide-react";
import { SkillsQuestion } from "@/types/skillsAssessment";
import { parseMarkdown } from "@/utils/markdownParser";
import { SkillsTestQuestionInput } from "./SkillsTestQuestionInput";

interface SkillsTestQuestionCardProps {
  question: SkillsQuestion;
  index: number;
}

const getQuestionIcon = (type: string) => {
  const icons = {
    text: FileText,
    long_text: FileText,
    video_upload: Video,
    video_link: Link,
    portfolio_link: Link,
    code_submission: Code,
    file_upload: Upload,
    pdf_upload: Upload,
    url_submission: Link
  };
  return icons[type as keyof typeof icons] || FileText;
};

const getQuestionTypeLabel = (type: string) => {
  const labels = {
    text: "Text Response",
    long_text: "Long Text Response",
    video_upload: "Video Upload",
    video_link: "Video Link",
    portfolio_link: "Portfolio Link",
    code_submission: "Code Submission",
    file_upload: "File Upload",
    pdf_upload: "PDF Upload",
    url_submission: "URL Submission"
  };
  return labels[type as keyof typeof labels] || type;
};

export const SkillsTestQuestionCard = ({ question, index }: SkillsTestQuestionCardProps) => {
  const IconComponent = getQuestionIcon(question.type);

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-gray-900 text-lg leading-relaxed">{question.question}</h3>
                {question.required && (
                  <span className="text-red-500 text-sm">*</span>
                )}
              </div>
              
              {question.candidateInstructions && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div 
                    className="text-gray-700 prose prose-sm max-w-none 
                      prose-headings:text-gray-800 prose-headings:font-medium prose-headings:mb-2 prose-headings:mt-3
                      prose-p:mb-3 prose-p:leading-relaxed prose-p:text-gray-700
                      prose-ul:mb-4 prose-ul:space-y-2 prose-li:mb-2 prose-li:text-gray-700 prose-li:leading-relaxed
                      prose-ol:mb-4 prose-ol:space-y-2 prose-li:mb-2 prose-li:text-gray-700 prose-li:leading-relaxed
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
                    dangerouslySetInnerHTML={{ 
                      __html: parseMarkdown(question.candidateInstructions) 
                    }}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <IconComponent className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {getQuestionTypeLabel(question.type)}
                </span>
                {question.timeLimit && (
                  <span className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                    {question.timeLimit} min limit
                  </span>
                )}
                {question.characterLimit && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {question.characterLimit} char limit
                  </span>
                )}
              </div>

              <SkillsTestQuestionInput type={question.type} />

              {question.exampleResponse && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-900 mb-3">Example Response:</h4>
                  <div 
                    className="text-green-800 prose prose-sm max-w-none 
                      prose-headings:text-green-900 prose-headings:font-medium prose-headings:mb-2 prose-headings:mt-3
                      prose-p:mb-3 prose-p:leading-relaxed prose-p:text-green-800
                      prose-ul:mb-4 prose-ul:space-y-2 prose-li:mb-2 prose-li:text-green-800 prose-li:leading-relaxed
                      prose-ol:mb-4 prose-ol:space-y-2 prose-li:mb-2 prose-li:text-green-800 prose-li:leading-relaxed
                      prose-strong:text-green-900 prose-strong:font-semibold
                      prose-code:bg-green-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
                    dangerouslySetInnerHTML={{ 
                      __html: parseMarkdown(question.exampleResponse) 
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
