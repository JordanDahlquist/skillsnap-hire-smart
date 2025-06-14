
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailRichTextEditor } from '@/components/inbox/EmailRichTextEditor';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Users, FileText, User, AtSign, Building, Briefcase, Loader2 } from 'lucide-react';
import type { EmailTemplate, EmailFormData, Application } from '@/types/emailComposer';

interface CompactEmailFormProps {
  applications: Application[];
  templates: EmailTemplate[];
  templatesLoading: boolean;
  formData: EmailFormData;
  fromEmail: string;
  updateField: (field: keyof EmailFormData, value: string | boolean) => void;
  selectTemplate: (template: EmailTemplate) => void;
  onSend: () => void;
  isSending: boolean;
  canSend: boolean;
}

export const CompactEmailForm = ({
  applications,
  templates,
  templatesLoading,
  formData,
  fromEmail,
  updateField,
  selectTemplate,
  onSend,
  isSending,
  canSend
}: CompactEmailFormProps) => {
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      selectTemplate(template);
    }
  };

  const variables = [
    { name: '{name}', icon: User, description: 'Candidate name' },
    { name: '{email}', icon: AtSign, description: 'Email' },
    { name: '{position}', icon: Briefcase, description: 'Job position' },
    { name: '{company}', icon: Building, description: 'Company' }
  ];

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Top Row - Recipients and Template */}
      <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
        {/* Recipients */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">To:</span>
          <div className="flex items-center gap-1">
            {applications.slice(0, 3).map((app) => (
              <Avatar key={app.id} className="w-6 h-6">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                  {app.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ))}
            {applications.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{applications.length - 3}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {applications.length} recipient{applications.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-2 ml-auto">
          <FileText className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium">Template:</span>
          {templatesLoading ? (
            <div className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <Select value={formData.templateId} onValueChange={handleTemplateSelect}>
              <SelectTrigger className="w-48 h-8 text-xs">
                <SelectValue placeholder="Choose template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id} className="text-xs">
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* From Field */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">From</Label>
        <Input
          value={fromEmail}
          disabled
          className="h-8 text-xs bg-muted/50 border-0"
        />
      </div>

      {/* Subject Field */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">Subject</Label>
        <Input
          value={formData.subject}
          onChange={(e) => updateField('subject', e.target.value)}
          placeholder="Email subject..."
          className="h-8 text-sm"
        />
      </div>

      {/* Message Editor */}
      <div className="flex-1 flex flex-col space-y-1 min-h-0">
        <Label className="text-xs font-medium text-muted-foreground">Message</Label>
        <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
          <EmailRichTextEditor
            value={formData.content}
            onChange={(content) => updateField('content', content)}
            placeholder="Write your email message..."
            variables={variables}
          />
        </div>
      </div>

      {/* Send Button */}
      <div className="flex justify-end pt-2 border-t">
        <Button
          onClick={onSend}
          disabled={!canSend || isSending}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
