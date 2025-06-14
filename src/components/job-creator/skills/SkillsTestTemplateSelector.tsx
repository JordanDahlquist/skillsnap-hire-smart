
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Code, Palette, Megaphone, UserCheck, FileText, Plus } from "lucide-react";
import { SkillsTestTemplate } from "@/types/skillsAssessment";

interface SkillsTestTemplateSelectorProps {
  onSelectTemplate: (template: SkillsTestTemplate | null) => void;
  onBack: () => void;
}

const templates: SkillsTestTemplate[] = [
  {
    id: 'custom',
    name: 'Custom Template',
    description: 'Start from scratch and build your own assessment',
    category: 'custom',
    questions: [],
    estimatedTime: 0,
    icon: 'Plus'
  },
  {
    id: 'developer',
    name: 'Software Developer',
    description: 'Code submission, portfolio review, and technical questions',
    category: 'developer',
    estimatedTime: 45,
    questions: [
      {
        question: 'Please share a link to your GitHub profile or portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Provide a link to your best coding work',
        evaluationGuidelines: 'Look for clean code, good documentation, and project diversity',
        required: true,
        order: 1
      },
      {
        question: 'Solve this coding challenge',
        type: 'code_submission',
        candidateInstructions: 'Write a function that finds the longest palindromic substring',
        evaluationGuidelines: 'Check for efficiency, edge case handling, and code clarity',
        required: true,
        order: 2
      }
    ]
  },
  {
    id: 'designer',
    name: 'UI/UX Designer',
    description: 'Portfolio review, design challenge, and case study',
    category: 'designer',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share your design portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Provide a link to your best design work',
        evaluationGuidelines: 'Assess visual design skills, user experience thinking, and project variety',
        required: true,
        order: 1
      },
      {
        question: 'Describe your design process for a recent project',
        type: 'long_text',
        candidateInstructions: 'Walk us through your approach from research to final design',
        evaluationGuidelines: 'Look for structured thinking, user-centered approach, and problem-solving skills',
        required: true,
        order: 2,
        characterLimit: 1000
      }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing Specialist',
    description: 'Campaign examples, strategy questions, and content creation',
    category: 'marketing',
    estimatedTime: 30,
    questions: [
      {
        question: 'Describe a successful marketing campaign you\'ve worked on',
        type: 'long_text',
        candidateInstructions: 'Include the challenge, strategy, execution, and results',
        evaluationGuidelines: 'Look for strategic thinking, creativity, and measurable impact',
        required: true,
        order: 1,
        characterLimit: 800
      }
    ]
  },
  {
    id: 'sales',
    name: 'Sales Representative',
    description: 'Role-play scenarios, video pitch, and experience questions',
    category: 'sales',
    estimatedTime: 25,
    questions: [
      {
        question: 'Record a 2-minute sales pitch for our product',
        type: 'video_upload',
        candidateInstructions: 'Imagine you\'re presenting to a potential client',
        evaluationGuidelines: 'Assess communication skills, persuasiveness, and product understanding',
        required: true,
        order: 1,
        timeLimit: 2
      }
    ]
  }
];

const getIcon = (iconName: string) => {
  const icons = {
    Plus: Plus,
    Code: Code,
    Palette: Palette,
    Megaphone: Megaphone,
    UserCheck: UserCheck,
    FileText: FileText
  };
  return icons[iconName as keyof typeof icons] || FileText;
};

export const SkillsTestTemplateSelector = ({ 
  onSelectTemplate, 
  onBack 
}: SkillsTestTemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'custom', name: 'Custom' },
    { id: 'developer', name: 'Developer' },
    { id: 'designer', name: 'Designer' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'sales', name: 'Sales' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
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
          <CardTitle className="text-lg">Choose a Template</CardTitle>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const IconComponent = getIcon(template.icon || 'FileText');
            
            return (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                onClick={() => onSelectTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{template.name}</h4>
                        {template.estimatedTime > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {template.estimatedTime}m
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {template.description}
                      </p>
                      {template.questions.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {template.questions.length} question{template.questions.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
