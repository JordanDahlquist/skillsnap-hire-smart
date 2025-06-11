
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Template, Star, Loader2 } from 'lucide-react';
import type { EmailTemplate } from '@/types/emailComposer';

interface TemplateGalleryProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  selectedTemplateId: string;
  onSelectTemplate: (template: EmailTemplate) => void;
}

export const TemplateGallery = ({
  templates,
  isLoading,
  selectedTemplateId,
  onSelectTemplate
}: TemplateGalleryProps) => {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-0 shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading templates...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-0 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-purple-500 rounded-xl text-white">
            <Template className="w-5 h-5" />
          </div>
          Email Templates
          <Badge variant="outline" className="ml-auto">
            {templates.length} available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-64">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`relative group cursor-pointer transition-all duration-200 ${
                  selectedTemplateId === template.id
                    ? 'ring-2 ring-purple-500 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => onSelectTemplate(template)}
              >
                <Card className={`h-full ${
                  selectedTemplateId === template.id
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200'
                    : 'bg-white/70 hover:bg-white/90 border-white/50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {template.name}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-gray-100 text-gray-600"
                        >
                          {template.category}
                        </Badge>
                      </div>
                      {selectedTemplateId === template.id && (
                        <div className="p-1 bg-purple-500 rounded-full text-white">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {template.subject}
                    </p>
                    
                    <p className="text-xs text-gray-500 line-clamp-3">
                      {template.content.substring(0, 120)}...
                    </p>
                    
                    {template.variables && template.variables.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-3 pt-3 border-t border-gray-200">
                        {template.variables.slice(0, 3).map((variable) => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                        {template.variables.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.variables.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
