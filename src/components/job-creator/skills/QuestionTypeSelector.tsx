
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Video, 
  Link, 
  Code, 
  Upload, 
  List,
  ExternalLink
} from "lucide-react";

interface QuestionType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'text' | 'media' | 'file' | 'link';
  badge?: string;
}

const questionTypes: QuestionType[] = [
  {
    id: 'text',
    name: 'Short Text',
    description: 'Simple text response, ideal for brief answers',
    icon: FileText,
    category: 'text'
  },
  {
    id: 'long_text',
    name: 'Long Text',
    description: 'Detailed text response with more space',
    icon: FileText,
    category: 'text'
  },
  {
    id: 'multiple_choice',
    name: 'Multiple Choice',
    description: 'Select from predefined options',
    icon: List,
    category: 'text'
  },
  {
    id: 'code_submission',
    name: 'Code Editor',
    description: 'Programming challenges with syntax highlighting',
    icon: Code,
    category: 'text'
  },
  {
    id: 'video_upload',
    name: 'Video Recording',
    description: 'Record or upload video responses',
    icon: Video,
    category: 'media'
  },
  {
    id: 'file_upload',
    name: 'File Upload',
    description: 'Upload documents, images, or other files',
    icon: Upload,
    category: 'file'
  },
  {
    id: 'pdf_upload',
    name: 'PDF Upload',
    description: 'Specifically for PDF documents',
    icon: Upload,
    category: 'file'
  },
  {
    id: 'portfolio_link',
    name: 'Portfolio Link',
    description: 'Share portfolio or work samples via URL',
    icon: ExternalLink,
    category: 'link'
  },
  {
    id: 'video_link',
    name: 'Video Link',
    description: 'Link to external video (YouTube, Vimeo, etc.)',
    icon: Link,
    category: 'link'
  },
  {
    id: 'url_submission',
    name: 'URL Submission',
    description: 'General URL or website link',
    icon: Link,
    category: 'link'
  }
];

const categoryColors = {
  text: 'bg-blue-50 border-blue-200',
  media: 'bg-purple-50 border-purple-200',
  file: 'bg-green-50 border-green-200',
  link: 'bg-orange-50 border-orange-200'
};

const categoryLabels = {
  text: 'Text & Code',
  media: 'Media',
  file: 'File Upload',
  link: 'Links'
};

interface QuestionTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
  className?: string;
}

export const QuestionTypeSelector = ({
  selectedType,
  onTypeSelect,
  className = ""
}: QuestionTypeSelectorProps) => {
  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="font-medium text-gray-900 mb-3">Select Question Type</h4>
      
      {categories.map(category => {
        const categoryTypes = questionTypes.filter(type => type.category === category);
        
        return (
          <div key={category} className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700">
              {categoryLabels[category]}
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryTypes.map(type => {
                const IconComponent = type.icon;
                const isSelected = selectedType === type.id;
                const isDisabled = type.badge === 'Coming Soon';
                
                return (
                  <Card
                    key={type.id}
                    className={`
                      cursor-pointer transition-all duration-200 hover:shadow-sm
                      ${isSelected 
                        ? `ring-2 ring-blue-500 ${categoryColors[category]}` 
                        : `border-gray-200 hover:border-gray-300 ${isDisabled ? 'opacity-50' : ''}`
                      }
                      ${isDisabled ? 'cursor-not-allowed' : ''}
                    `}
                    onClick={() => !isDisabled && onTypeSelect(type.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`
                          p-2 rounded-lg flex-shrink-0
                          ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                        `}>
                          <IconComponent className={`
                            w-4 h-4 
                            ${isSelected ? 'text-blue-600' : 'text-gray-600'}
                          `} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h6 className="font-medium text-sm text-gray-900 truncate">
                              {type.name}
                            </h6>
                            {type.badge && (
                              <Badge variant="outline" className="text-xs">
                                {type.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
