
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
      <div className="flex-shrink-0 p-4 glass-content border-b border-white/20 space-y-3">
        {/* From field */}
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium text-slate-700 w-16 flex-shrink-0">From:</Label>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Input
              value={fromEmail}
              disabled
              className="text-sm glass-content border-0 text-slate-600 h-8 p-2 flex-1"
            />
            <Badge variant="secondary" className="text-xs glass-button-premium text-green-700 h-6 px-2 flex-shrink-0">
              ✓
            </Badge>
          </div>
        </div>

        {/* Subject field */}
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium text-slate-700 w-16 flex-shrink-0">Subject:</Label>
          <Input
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Enter email subject..."
            className="text-sm h-8 flex-1 glass-content border-white/30 focus:border-blue-400/50"
          />
        </div>
      </div>

      {/* Content editor with expanded height */}
      <div className="flex-1 min-h-0 flex flex-col p-4">
        <Label className="text-sm font-medium text-slate-700 mb-2">Message</Label>
        <div className="flex-1 min-h-0 glass-content rounded-xl overflow-hidden">
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
