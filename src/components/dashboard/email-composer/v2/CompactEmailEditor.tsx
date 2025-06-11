
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EmailRichTextEditor } from '@/components/inbox/EmailRichTextEditor';
import { Badge } from '@/components/ui/badge';
import { User, AtSign, Building, Briefcase } from 'lucide-react';

interface CompactEmailEditorProps {
  subject: string;
  content: string;
  fromEmail: string;
  onSubjectChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

export const CompactEmailEditor = ({
  subject,
  content,
  fromEmail,
  onSubjectChange,
  onContentChange
}: CompactEmailEditorProps) => {
  const variables = [
    { name: '{name}', icon: User, description: 'Candidate name' },
    { name: '{email}', icon: AtSign, description: 'Email' },
    { name: '{position}', icon: Briefcase, description: 'Job position' },
    { name: '{company}', icon: Building, description: 'Company' }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-gray-50/30">
        <div className="space-y-3">
          {/* From field */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-600">From</Label>
            <div className="flex items-center gap-2">
              <Input
                value={fromEmail}
                disabled
                className="text-sm bg-gray-50 text-gray-600 h-8"
              />
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                Verified
              </Badge>
            </div>
          </div>

          {/* Subject field */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-600">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="Enter email subject..."
              className="text-sm h-8"
            />
          </div>
        </div>
      </div>

      {/* Content editor */}
      <div className="flex-1 min-h-0 p-4">
        <div className="h-full flex flex-col space-y-3">
          <Label className="text-xs font-medium text-gray-600">Message</Label>
          <div className="flex-1 min-h-0">
            <EmailRichTextEditor
              value={content}
              onChange={onContentChange}
              placeholder="Type your email message..."
            />
          </div>
        </div>
      </div>

      {/* Variables footer */}
      <div className="flex-shrink-0 p-4 border-t bg-gray-50/30">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-600">Quick Variables</Label>
          <div className="flex flex-wrap gap-1">
            {variables.map((variable) => {
              const IconComponent = variable.icon;
              return (
                <button
                  key={variable.name}
                  onClick={() => onContentChange(content + ` ${variable.name}`)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50 transition-colors"
                  title={variable.description}
                >
                  <IconComponent className="w-3 h-3 text-gray-500" />
                  <code className="text-blue-600">{variable.name}</code>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
