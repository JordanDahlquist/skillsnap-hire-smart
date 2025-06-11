
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
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
        <FileText className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-medium text-gray-700">Template:</span>
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
      <FileText className="w-4 h-4 text-purple-600" />
      <span className="text-sm font-medium text-gray-700">Template:</span>
      
      <Select value={selectedTemplateId || 'none'} onValueChange={handleTemplateChange}>
        <SelectTrigger className="w-80 h-8 text-sm">
          <SelectValue placeholder="Choose a template (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No template</SelectItem>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex items-center gap-2">
                <span className="truncate">{template.name}</span>
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {templates.length > 0 && (
        <Badge variant="outline" className="text-xs text-gray-500">
          {templates.length} available
        </Badge>
      )}
    </div>
  );
};
