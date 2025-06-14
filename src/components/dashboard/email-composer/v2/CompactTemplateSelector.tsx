
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Template, Loader2, FileText } from 'lucide-react';
import type { EmailTemplate } from '@/types/emailComposer';

interface CompactTemplateSelectorProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  selectedTemplateId: string;
  onSelectTemplate: (template: EmailTemplate) => void;
}

export const CompactTemplateSelector = ({
  templates,
  isLoading,
  selectedTemplateId,
  onSelectTemplate
}: CompactTemplateSelectorProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Template className="w-4 h-4 text-purple-500" />
        <h4 className="font-medium text-foreground">Email Templates</h4>
        {selectedTemplateId && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
            Template Selected
          </Badge>
        )}
      </div>

      {templates.length === 0 ? (
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No templates available</p>
          <p className="text-xs text-muted-foreground">You can still compose your email manually</p>
        </div>
      ) : (
        <ScrollArea className="h-32 w-full">
          <div className="space-y-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplateId === template.id ? "default" : "ghost"}
                className={`w-full justify-start text-left h-auto p-3 ${
                  selectedTemplateId === template.id 
                    ? 'glass-button bg-purple-500 text-white' 
                    : 'glass-card-no-hover hover:bg-background/50'
                }`}
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-medium text-sm">{template.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <span className="text-xs opacity-80 truncate w-full">
                    {template.subject}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
