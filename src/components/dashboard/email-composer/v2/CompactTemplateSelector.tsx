
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Loader2 } from 'lucide-react';
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

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onSelectTemplate(template);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-purple-500" />
        <h4 className="font-medium text-foreground">Email Templates</h4>
        {selectedTemplateId && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
            Template Selected
          </Badge>
        )}
      </div>

      {templates.length === 0 ? (
        <div className="text-center p-4 glass-card rounded-lg">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No templates available</p>
          <p className="text-xs text-muted-foreground">You can still compose your email manually</p>
        </div>
      ) : (
        <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
          <SelectTrigger className="glass-card-no-hover border-0 bg-background/50 h-auto min-h-[44px]">
            <SelectValue placeholder="Select a template...">
              {selectedTemplate && (
                <div className="flex flex-col items-start gap-1 text-left">
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-medium text-sm">{selectedTemplate.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedTemplate.category}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {selectedTemplate.subject}
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="glass-card border-0 bg-background/95 backdrop-blur-sm">
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id} className="p-3">
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-medium text-sm">{template.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {template.subject}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
