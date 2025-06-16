
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft } from "lucide-react";
import { DEFAULT_INTERVIEW_TEMPLATES, InterviewQuestionTemplate } from "@/types/interviewQuestions";

interface InterviewQuestionTemplateSelectorProps {
  onSelectTemplate: (template: InterviewQuestionTemplate) => void;
  onBack: () => void;
}

export const InterviewQuestionTemplateSelector = ({ 
  onSelectTemplate, 
  onBack 
}: InterviewQuestionTemplateSelectorProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'developer': return 'bg-blue-100 text-blue-800';
      case 'designer': return 'bg-purple-100 text-purple-800';
      case 'sales': return 'bg-green-100 text-green-800';
      case 'management': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h3 className="text-lg font-medium">Choose Interview Template</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEFAULT_INTERVIEW_TEMPLATES.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    ~{template.estimatedTime} min
                  </div>
                  <span>{template.questions.length} questions</span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Sample Questions:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {template.questions.slice(0, 2).map((question, index) => (
                      <li key={index} className="truncate">
                        • {question.question}
                      </li>
                    ))}
                    {template.questions.length > 2 && (
                      <li className="text-gray-500">
                        +{template.questions.length - 2} more questions
                      </li>
                    )}
                  </ul>
                </div>

                <Button 
                  className="w-full mt-4" 
                  onClick={() => onSelectTemplate(template)}
                >
                  Use This Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
