
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
      {/* Compact header */}
      <div className="flex-shrink-0 p-2 border-b bg-gray-50/50 space-y-2">
        {/* From field */}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-gray-600 w-12 flex-shrink-0">From:</Label>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Input
              value={fromEmail}
              disabled
              className="text-xs bg-gray-50 text-gray-600 h-6 border-0 p-1 flex-1"
            />
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 h-4 px-1 flex-shrink-0">
              ✓
            </Badge>
          </div>
        </div>

        {/* Subject field */}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-gray-600 w-12 flex-shrink-0">Subject:</Label>
          <Input
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Enter email subject..."
            className="text-xs h-6 flex-1"
          />
        </div>
      </div>

      {/* Content editor */}
      <div className="flex-1 min-h-0 flex flex-col p-2">
        <Label className="text-xs font-medium text-gray-600 mb-1">Message</Label>
        <div className="flex-1 min-h-0">
          <EmailRichTextEditor
            value={content}
            onChange={onContentChange}
            placeholder="Type your email message..."
          />
        </div>
      </div>

      {/* Variables footer */}
      <div className="flex-shrink-0 p-2 border-t bg-gray-50/50">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-600">Quick Variables</Label>
          <div className="flex flex-wrap gap-1">
            {variables.map((variable) => {
              const IconComponent = variable.icon;
              return (
                <button
                  key={variable.name}
                  onClick={() => onContentChange(content + ` ${variable.name}`)}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-white border rounded hover:bg-gray-50 transition-colors"
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
