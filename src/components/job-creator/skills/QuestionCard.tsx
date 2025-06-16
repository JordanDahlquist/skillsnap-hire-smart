
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  GripVertical, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Settings,
  Eye,
  FileText,
  Video,
  Link,
  Code,
  Upload
} from "lucide-react";
import { SkillsQuestion } from "@/types/skillsAssessment";
import { QuestionTypeSelector } from "./QuestionTypeSelector";
import { QuestionPreview } from "./QuestionPreview";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface QuestionCardProps {
  question: SkillsQuestion;
  index: number;
  onUpdate: (updates: Partial<SkillsQuestion>) => void;
  onDelete: () => void;
  onPreview: () => void;
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
    text: "Short Text",
    long_text: "Long Text",
    multiple_choice: "Multiple Choice",
    file_upload: "File Upload",
    video_upload: "Video Upload",
    video_link: "Video Link",
    portfolio_link: "Portfolio Link",
    code_submission: "Code Submission",
    pdf_upload: "PDF Upload",
    url_submission: "URL Submission"
  };
  return labels[type as keyof typeof labels] || type;
};

export const QuestionCard = ({
  question,
  index,
  onUpdate,
  onDelete,
  onPreview
}: QuestionCardProps) => {
  const [isEditingType, setIsEditingType] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const IconComponent = getQuestionIcon(question.type);
  const isComplete = question.question.trim().length > 0;

  const handleTypeChange = (newType: string) => {
    onUpdate({ type: newType as any });
    setIsEditingType(false);
  };

  return (
    <Card className={`
      transition-all duration-200 
      ${isComplete 
        ? 'border-green-200 bg-green-50/30' 
        : question.question.trim().length > 0 
          ? 'border-blue-200 bg-blue-50/30'
          : 'border-gray-200'
      }
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
              {index + 1}
            </div>
            <IconComponent className="w-4 h-4 text-gray-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">
                {question.question || `Question ${index + 1}`}
              </h4>
              {isComplete && (
                <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                  Complete
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isEditingType ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingType(false)}
                  className="h-6 px-2 text-xs"
                >
                  Cancel
                </Button>
              ) : (
                <button
                  onClick={() => setIsEditingType(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  {getQuestionTypeLabel(question.type)}
                </button>
              )}
              
              {question.required && (
                <Badge variant="outline" className="text-xs">Required</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditingType && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <QuestionTypeSelector
              selectedType={question.type}
              onTypeSelect={handleTypeChange}
            />
          </div>
        )}

        {showPreview && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <QuestionPreview question={question} />
          </div>
        )}

        {/* Question Text */}
        <div>
          <Label htmlFor={`question-${question.id}`} className="text-sm font-medium">
            Question *
          </Label>
          <Textarea
            id={`question-${question.id}`}
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Enter your question here..."
            className="mt-1 resize-none"
            rows={2}
          />
        </div>

        {/* Instructions */}
        <div>
          <Label htmlFor={`instructions-${question.id}`} className="text-sm font-medium">
            Instructions for Candidates
          </Label>
          <Textarea
            id={`instructions-${question.id}`}
            value={question.candidateInstructions || ""}
            onChange={(e) => onUpdate({ candidateInstructions: e.target.value })}
            placeholder="Provide clear instructions and context for this question..."
            className="mt-1 resize-none"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use **bold** for emphasis, bullet points with -, and ## for headings
          </p>
        </div>

        {/* Basic Settings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id={`required-${question.id}`}
              checked={question.required}
              onCheckedChange={(checked) => onUpdate({ required: checked })}
            />
            <Label htmlFor={`required-${question.id}`} className="text-sm">
              Required question
            </Label>
          </div>

          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Settings className="w-4 h-4 mr-1" />
                Advanced
                {showAdvanced ? (
                  <ChevronDown className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronRight className="w-4 h-4 ml-1" />
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4 mt-4 pt-4 border-t border-gray-200">
              {/* Type-specific settings */}
              {(question.type === 'text' || question.type === 'long_text') && (
                <div>
                  <Label htmlFor={`char-limit-${question.id}`} className="text-sm font-medium">
                    Character Limit
                  </Label>
                  <Input
                    id={`char-limit-${question.id}`}
                    type="number"
                    value={question.characterLimit || ""}
                    onChange={(e) => onUpdate({ characterLimit: parseInt(e.target.value) || undefined })}
                    placeholder="Optional"
                    className="mt-1"
                  />
                </div>
              )}

              {question.type === 'video_upload' && (
                <div>
                  <Label htmlFor={`time-limit-${question.id}`} className="text-sm font-medium">
                    Time Limit (minutes)
                  </Label>
                  <Input
                    id={`time-limit-${question.id}`}
                    type="number"
                    value={question.timeLimit || ""}
                    onChange={(e) => onUpdate({ timeLimit: parseInt(e.target.value) || undefined })}
                    placeholder="e.g. 5"
                    className="mt-1"
                  />
                </div>
              )}

              {/* Evaluation Guidelines */}
              <div>
                <Label htmlFor={`evaluation-${question.id}`} className="text-sm font-medium">
                  Evaluation Guidelines (Hidden from candidates)
                </Label>
                <Textarea
                  id={`evaluation-${question.id}`}
                  value={question.evaluationGuidelines || ""}
                  onChange={(e) => onUpdate({ evaluationGuidelines: e.target.value })}
                  placeholder="What should reviewers look for in responses?"
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>

              {/* Example Response */}
              <div>
                <Label htmlFor={`example-${question.id}`} className="text-sm font-medium">
                  Example Response
                </Label>
                <Textarea
                  id={`example-${question.id}`}
                  value={question.exampleResponse || ""}
                  onChange={(e) => onUpdate({ exampleResponse: e.target.value })}
                  placeholder="Optional example of a good response"
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};
