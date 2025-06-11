
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
      <div className="flex-shrink-0 p-2 border-b border-white/10 glass-content space-y-2">
        {/* From field */}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-contrast-safe w-12 flex-shrink-0">From:</Label>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Input
              value={fromEmail}
              disabled
              className="text-xs glass-content text-contrast-safe-light h-6 border-white/20 p-1 flex-1"
            />
            <Badge variant="secondary" className="text-xs bg-green-100/80 text-green-700 h-4 px-1 flex-shrink-0">
              ✓
            </Badge>
          </div>
        </div>

        {/* Subject field */}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-contrast-safe w-12 flex-shrink-0">Subject:</Label>
          <Input
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Enter email subject..."
            className="text-xs h-6 flex-1 glass-content border-white/20 text-contrast-safe placeholder:text-contrast-safe-light"
          />
        </div>
      </div>

      {/* Content editor with expanded height */}
      <div className="flex-1 min-h-0 flex flex-col p-2">
        <Label className="text-xs font-medium text-contrast-safe mb-1">Message</Label>
        <div className="flex-1 min-h-0 border border-white/20 rounded glass-content">
          <EmailRichTextEditor
            value={content}
            onChange={onContentChange}
            placeholder="Type your email message..."
            variables={variables}
          />
        </div>
      </div>
    </div>
  );
};
