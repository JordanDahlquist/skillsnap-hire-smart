
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  const handleTemplateChange = (templateId: string) => {
    if (templateId === 'none') {
      return;
    }
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onSelectTemplate(template);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 glass-content rounded-lg border border-white/20 text-sm">
        <FileText className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-medium text-contrast-safe">Template:</span>
        <div className="flex items-center gap-2 text-contrast-safe-light">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-xs">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 glass-content rounded-lg border border-white/20 text-sm">
      <FileText className="w-4 h-4 text-purple-600" />
      <span className="text-xs font-medium text-contrast-safe min-w-fit">Template:</span>
      
      <Select value={selectedTemplateId || 'none'} onValueChange={handleTemplateChange}>
        <SelectTrigger className="h-6 text-xs border-0 bg-transparent p-0 focus:ring-0 flex-1 text-contrast-safe">
          <SelectValue placeholder="Choose template (optional)" />
        </SelectTrigger>
        <SelectContent className="glass-content border border-white/20">
          <SelectItem value="none">No template</SelectItem>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex items-center gap-2">
                <span className="truncate">{template.name}</span>
                <Badge variant="outline" className="text-xs border-white/20">
                  {template.category}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {templates.length > 0 && (
        <Badge variant="outline" className="text-xs py-0 px-1.5 h-4 text-contrast-safe-light border-white/20">
          {templates.length}
        </Badge>
      )}
    </div>
  );
};
