
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { EmailTemplate } from '@/types/emailComposer';

interface EmailTemplateSelectorProps {
  templates: EmailTemplate[];
  selectedTemplateId: string;
  onTemplateSelect: (template: EmailTemplate) => void;
}

export const EmailTemplateSelector = ({
  templates,
  selectedTemplateId,
  onTemplateSelect
}: EmailTemplateSelectorProps) => {
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onTemplateSelect(template);
    }
  };

  return (
    <div>
      <Label htmlFor="template">Email Template (Optional)</Label>
      <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a template..." />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex items-center gap-2">
                <span>{template.name}</span>
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
