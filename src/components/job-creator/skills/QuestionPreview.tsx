
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText,
  Video,
  Link,
  Code,
  Upload,
  Clock,
  Type
} from "lucide-react";
import { SkillsQuestion } from "@/types/skillsAssessment";
import { parseMarkdown } from "@/utils/markdownParser";

interface QuestionPreviewProps {
  question: SkillsQuestion;
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

export const QuestionPreview = ({ question }: QuestionPreviewProps) => {
  const IconComponent = getQuestionIcon(question.type);

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            placeholder="Your answer here..."
            disabled
            className="bg-gray-50"
          />
        );

      case 'long_text':
        return (
          <Textarea
            placeholder="Your detailed response here..."
            disabled
            className="bg-gray-50 resize-none h-24"
          />
        );

      case 'video_upload':
      case 'file_upload':
      case 'pdf_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {question.type === 'video_upload' 
                ? 'Click to upload video or record' 
                : 'Click to upload file'
              }
            </p>
          </div>
        );

      case 'portfolio_link':
      case 'video_link':
      case 'url_submission':
        return (
          <Input
            type="url"
            placeholder="https://..."
            disabled
            className="bg-gray-50"
          />
        );

      case 'code_submission':
        return (
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
            <div className="text-gray-500">// Your code here...</div>
            <div className="text-gray-600">function solution() {'{'}</div>
            <div className="text-gray-600 ml-4">// Implementation</div>
            <div className="text-gray-600">{'}'}</div>
          </div>
        );

      default:
        return (
          <Input
            placeholder="Your answer here..."
            disabled
            className="bg-gray-50"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="font-medium text-blue-900">Candidate Preview</h4>
        <Badge variant="outline" className="text-xs">
          How this appears to applicants
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-blue-600 font-medium text-sm">?</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-gray-900">
                {question.question || 'Your question will appear here'}
              </h3>
              {question.required && (
                <span className="text-red-500 text-sm">*</span>
              )}
            </div>

            {question.candidateInstructions && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
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

            <div className="flex items-center gap-2 mb-3">
              <IconComponent className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {getQuestionTypeLabel(question.type)}
              </span>
              
              {question.timeLimit && (
                <span className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {question.timeLimit} min limit
                </span>
              )}
              
              {question.characterLimit && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                  <Type className="w-3 h-3" />
                  {question.characterLimit} char limit
                </span>
              )}
            </div>

            {renderInput()}

            {question.exampleResponse && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 mb-2">Example Response:</h4>
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
    </div>
  );
};
