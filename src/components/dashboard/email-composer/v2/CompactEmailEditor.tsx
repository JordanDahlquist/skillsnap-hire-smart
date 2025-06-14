
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EmailRichTextEditor } from '@/components/inbox/EmailRichTextEditor';
import { Badge } from '@/components/ui/badge';
import { User, AtSign, Building, Briefcase, Shield } from 'lucide-react';

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
      {/* Email Header Fields */}
      <div className="flex-shrink-0 p-4 border-b border-border/30 bg-background/30 space-y-4">
        {/* From field */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            From Address
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={fromEmail}
              disabled
              className="glass-card-no-hover border-0 bg-background/50 text-muted-foreground text-sm h-9 flex-1"
            />
            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-2 py-1 flex-shrink-0">
              Verified
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Your unique email address for private conversations</p>
        </div>

        {/* Subject field */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Subject Line</Label>
          <Input
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Enter email subject..."
            className="glass-card-no-hover border-0 bg-background/50 text-sm h-9"
          />
        </div>
      </div>

      {/* Content editor */}
      <div className="flex-1 min-h-0 flex flex-col p-4">
        <Label className="text-sm font-medium text-foreground mb-3">Message Content</Label>
        <div className="flex-1 min-h-0 glass-card-no-hover rounded-xl overflow-hidden border-0">
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
