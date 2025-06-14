
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Code, 
  Palette, 
  Megaphone, 
  UserCheck, 
  FileText, 
  Plus,
  Video,
  Sparkles,
  PenTool,
  Calendar,
  MessageCircle,
  Edit3,
  ClipboardList,
  Users,
  TrendingUp,
  BarChart3,
  Calculator
} from "lucide-react";
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
  },
  {
    id: 'video-editor',
    name: 'Video Editor',
    description: 'Portfolio reel, technical skills, and creative brief response',
    category: 'creative',
    estimatedTime: 40,
    questions: [
      {
        question: 'Share your video editing portfolio or demo reel',
        type: 'portfolio_link',
        candidateInstructions: 'Provide a link to your best video editing work (YouTube, Vimeo, etc.)',
        evaluationGuidelines: 'Assess technical proficiency, creativity, pacing, and storytelling ability',
        required: true,
        order: 1
      },
      {
        question: 'What video editing software are you most proficient in and why?',
        type: 'text',
        candidateInstructions: 'Describe your experience with different editing platforms',
        evaluationGuidelines: 'Look for depth of knowledge and tool expertise',
        required: true,
        order: 2
      },
      {
        question: 'Describe how you would approach editing a 30-second promotional video',
        type: 'long_text',
        candidateInstructions: 'Walk through your process from raw footage to final cut',
        evaluationGuidelines: 'Evaluate workflow understanding and creative process',
        required: true,
        order: 3,
        characterLimit: 600
      }
    ]
  },
  {
    id: 'animator-vfx',
    name: 'Animator/VFX Artist',
    description: 'Demo reel, animation techniques, and software proficiency',
    category: 'creative',
    estimatedTime: 45,
    questions: [
      {
        question: 'Upload your animation/VFX demo reel',
        type: 'video_upload',
        candidateInstructions: 'Show your best work in a 1-2 minute reel',
        evaluationGuidelines: 'Assess technical skill, creativity, and understanding of animation principles',
        required: true,
        order: 1,
        timeLimit: 3
      },
      {
        question: 'Which animation software do you specialize in?',
        type: 'text',
        candidateInstructions: 'List your primary tools and your proficiency level with each',
        evaluationGuidelines: 'Look for relevant software knowledge and depth of experience',
        required: true,
        order: 2
      },
      {
        question: 'Explain the 12 principles of animation and how you apply them',
        type: 'long_text',
        candidateInstructions: 'Choose 3-4 principles and give specific examples from your work',
        evaluationGuidelines: 'Test fundamental animation knowledge and practical application',
        required: true,
        order: 3,
        characterLimit: 800
      }
    ]
  },
  {
    id: 'graphic-designer',
    name: 'Graphic Designer',
    description: 'Portfolio showcase, brand design challenge, and design process',
    category: 'creative',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share your graphic design portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Provide a link showcasing your design range and style',
        evaluationGuidelines: 'Look for visual hierarchy, typography, color theory, and brand consistency',
        required: true,
        order: 1
      },
      {
        question: 'Create a simple logo concept for a fictional eco-friendly startup',
        type: 'file_upload',
        candidateInstructions: 'Upload a PDF or image file with your logo design and brief explanation',
        evaluationGuidelines: 'Assess creativity, brand understanding, and design execution',
        allowedFileTypes: ['pdf', 'jpg', 'png', 'svg'],
        required: true,
        order: 2
      },
      {
        question: 'How do you ensure your designs align with brand guidelines?',
        type: 'text',
        candidateInstructions: 'Describe your process for maintaining brand consistency',
        evaluationGuidelines: 'Look for understanding of brand strategy and attention to detail',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'executive-assistant',
    name: 'Executive Assistant / Virtual Assistant',
    description: 'Organization skills, communication samples, and time management',
    category: 'administrative',
    estimatedTime: 30,
    questions: [
      {
        question: 'How would you prioritize and manage multiple urgent tasks for different executives?',
        type: 'long_text',
        candidateInstructions: 'Describe your approach with a specific scenario',
        evaluationGuidelines: 'Assess organizational skills, prioritization ability, and problem-solving',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'Draft a professional email declining a meeting request',
        type: 'text',
        candidateInstructions: 'Write a polite but firm email suggesting alternative times',
        evaluationGuidelines: 'Look for professional tone, clarity, and diplomatic communication',
        required: true,
        order: 2
      },
      {
        question: 'What tools do you use for calendar management and task tracking?',
        type: 'text',
        candidateInstructions: 'List your preferred tools and explain why you chose them',
        evaluationGuidelines: 'Evaluate technical proficiency and tool selection reasoning',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'social-media-manager',
    name: 'Social Media Manager',
    description: 'Content strategy, analytics interpretation, and campaign examples',
    category: 'marketing',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share examples of social media campaigns you\'ve managed',
        type: 'portfolio_link',
        candidateInstructions: 'Provide links to successful campaigns or content you\'ve created',
        evaluationGuidelines: 'Look for engagement rates, content quality, and strategic thinking',
        required: true,
        order: 1
      },
      {
        question: 'How would you handle a negative comment or review on social media?',
        type: 'text',
        candidateInstructions: 'Describe your crisis management approach',
        evaluationGuidelines: 'Assess communication skills and crisis management ability',
        required: true,
        order: 2
      },
      {
        question: 'Create a content calendar outline for a week',
        type: 'file_upload',
        candidateInstructions: 'Upload a document showing your content planning approach',
        evaluationGuidelines: 'Look for strategic thinking, consistency, and platform understanding',
        allowedFileTypes: ['pdf', 'doc', 'docx'],
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'copywriter',
    name: 'Copywriter',
    description: 'Writing samples, brand voice adaptation, and SEO knowledge',
    category: 'content',
    estimatedTime: 40,
    questions: [
      {
        question: 'Share your portfolio of copywriting work',
        type: 'portfolio_link',
        candidateInstructions: 'Include various types of copy (web, email, ads, etc.)',
        evaluationGuidelines: 'Assess writing quality, versatility, and conversion-focused approach',
        required: true,
        order: 1
      },
      {
        question: 'Write a compelling product description for a premium coffee brand',
        type: 'text',
        candidateInstructions: 'Create copy that appeals to quality-conscious coffee lovers',
        evaluationGuidelines: 'Look for persuasive writing, brand voice consistency, and audience understanding',
        required: true,
        order: 2
      },
      {
        question: 'How do you optimize copy for SEO while maintaining readability?',
        type: 'long_text',
        candidateInstructions: 'Explain your approach to balancing SEO and user experience',
        evaluationGuidelines: 'Test SEO knowledge and understanding of user-first content',
        required: true,
        order: 3,
        characterLimit: 500
      }
    ]
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Planning scenarios, stakeholder communication, and methodology knowledge',
    category: 'management',
    estimatedTime: 35,
    questions: [
      {
        question: 'Describe how you would handle a project that\'s falling behind schedule',
        type: 'long_text',
        candidateInstructions: 'Walk through your problem-solving and communication approach',
        evaluationGuidelines: 'Look for leadership skills, problem-solving, and stakeholder management',
        required: true,
        order: 1,
        characterLimit: 700
      },
      {
        question: 'What project management methodologies are you familiar with?',
        type: 'text',
        candidateInstructions: 'Explain which ones you prefer and why',
        evaluationGuidelines: 'Assess methodology knowledge and practical application',
        required: true,
        order: 2
      },
      {
        question: 'How do you manage conflicting priorities from different stakeholders?',
        type: 'text',
        candidateInstructions: 'Provide a specific example if possible',
        evaluationGuidelines: 'Evaluate diplomatic skills and conflict resolution ability',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'customer-support',
    name: 'Customer Support Specialist',
    description: 'Problem-solving scenarios, communication skills, and empathy assessment',
    category: 'support',
    estimatedTime: 25,
    questions: [
      {
        question: 'How would you handle an angry customer who received a defective product?',
        type: 'text',
        candidateInstructions: 'Describe your step-by-step approach to resolution',
        evaluationGuidelines: 'Look for empathy, problem-solving skills, and de-escalation techniques',
        required: true,
        order: 1
      },
      {
        question: 'Record a sample support call response',
        type: 'video_upload',
        candidateInstructions: 'Role-play helping a customer with a billing issue (2-3 minutes)',
        evaluationGuidelines: 'Assess communication clarity, patience, and problem-solving approach',
        required: true,
        order: 2,
        timeLimit: 3
      },
      {
        question: 'What tools have you used for customer support and ticketing?',
        type: 'text',
        candidateInstructions: 'List your experience with support platforms and tools',
        evaluationGuidelines: 'Evaluate technical proficiency and platform familiarity',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Content portfolio, audience engagement strategies, and creative process',
    category: 'content',
    estimatedTime: 35,
    questions: [
      {
        question: 'Share your content creation portfolio',
        type: 'portfolio_link',
        candidateInstructions: 'Include your best content across different platforms',
        evaluationGuidelines: 'Assess creativity, consistency, and audience engagement',
        required: true,
        order: 1
      },
      {
        question: 'How do you research and plan content for different audiences?',
        type: 'long_text',
        candidateInstructions: 'Describe your content strategy and research process',
        evaluationGuidelines: 'Look for strategic thinking and audience understanding',
        required: true,
        order: 2,
        characterLimit: 600
      },
      {
        question: 'Create a content idea for a tech startup\'s LinkedIn page',
        type: 'text',
        candidateInstructions: 'Provide the concept, format, and why it would engage the audience',
        evaluationGuidelines: 'Assess creativity, platform knowledge, and business understanding',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Data interpretation, visualization examples, and analytical thinking',
    category: 'analytical',
    estimatedTime: 40,
    questions: [
      {
        question: 'Share examples of data visualizations or reports you\'ve created',
        type: 'portfolio_link',
        candidateInstructions: 'Include dashboards, charts, or analytical reports',
        evaluationGuidelines: 'Look for clear data storytelling and visualization best practices',
        required: true,
        order: 1
      },
      {
        question: 'Explain how you would analyze customer churn for a SaaS company',
        type: 'long_text',
        candidateInstructions: 'Describe your analytical approach and key metrics',
        evaluationGuidelines: 'Assess analytical thinking and business metric understanding',
        required: true,
        order: 2,
        characterLimit: 700
      },
      {
        question: 'What data analysis tools are you proficient in?',
        type: 'text',
        candidateInstructions: 'List tools and your experience level with each',
        evaluationGuidelines: 'Evaluate technical skills and tool proficiency',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'hr-specialist',
    name: 'HR Specialist',
    description: 'Scenario-based questions, policy knowledge, and people management',
    category: 'hr',
    estimatedTime: 30,
    questions: [
      {
        question: 'How would you handle a conflict between two team members?',
        type: 'long_text',
        candidateInstructions: 'Describe your mediation approach and steps you\'d take',
        evaluationGuidelines: 'Look for conflict resolution skills and people management ability',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'Describe your experience with HR policies and compliance',
        type: 'text',
        candidateInstructions: 'Include specific areas like employment law, benefits, or safety',
        evaluationGuidelines: 'Assess policy knowledge and compliance understanding',
        required: true,
        order: 2
      },
      {
        question: 'How do you ensure fair and unbiased hiring practices?',
        type: 'text',
        candidateInstructions: 'Explain your approach to diverse and inclusive recruitment',
        evaluationGuidelines: 'Evaluate understanding of diversity, equity, and inclusion principles',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'accountant',
    name: 'Accountant/Bookkeeper',
    description: 'Financial scenario analysis, attention to detail, and software proficiency',
    category: 'finance',
    estimatedTime: 35,
    questions: [
      {
        question: 'Explain how you would reconcile a bank statement with discrepancies',
        type: 'long_text',
        candidateInstructions: 'Walk through your step-by-step process for finding and resolving differences',
        evaluationGuidelines: 'Look for systematic approach, attention to detail, and problem-solving skills',
        required: true,
        order: 1,
        characterLimit: 600
      },
      {
        question: 'What accounting software are you proficient in?',
        type: 'text',
        candidateInstructions: 'List your experience with different accounting platforms',
        evaluationGuidelines: 'Assess technical proficiency and software knowledge',
        required: true,
        order: 2
      },
      {
        question: 'How do you ensure accuracy in financial reporting?',
        type: 'text',
        candidateInstructions: 'Describe your quality control and review processes',
        evaluationGuidelines: 'Evaluate attention to detail and quality assurance practices',
        required: true,
        order: 3
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
    FileText: FileText,
    Video: Video,
    Sparkles: Sparkles,
    PenTool: PenTool,
    Calendar: Calendar,
    MessageCircle: MessageCircle,
    Edit3: Edit3,
    ClipboardList: ClipboardList,
    Users: Users,
    TrendingUp: TrendingUp,
    BarChart3: BarChart3,
    Calculator: Calculator
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
    { id: 'creative', name: 'Creative' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'content', name: 'Content' },
    { id: 'administrative', name: 'Administrative' },
    { id: 'management', name: 'Management' },
    { id: 'support', name: 'Support' },
    { id: 'analytical', name: 'Analytical' },
    { id: 'hr', name: 'HR' },
    { id: 'finance', name: 'Finance' },
    { id: 'sales', name: 'Sales' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
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
        
        {/* Compact Category Filter */}
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-2 py-1 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap
                ${selectedCategory === category.id 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }
              `}
            >
              {category.name}
            </button>
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
