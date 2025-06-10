
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EmailComposerFormProps {
  subject: string;
  content: string;
  fromEmail: string;
  onSubjectChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

export const EmailComposerForm = ({
  subject,
  content,
  fromEmail,
  onSubjectChange,
  onContentChange
}: EmailComposerFormProps) => {
  return (
    <>
      <div>
        <Label htmlFor="from-email">From Address</Label>
        <Input
          id="from-email"
          value={fromEmail}
          disabled
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">
          Your unique email address for private conversations
        </p>
      </div>

      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Email subject..."
        />
      </div>

      <div>
        <Label htmlFor="content">Email Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Email content..."
          rows={10}
        />
        <p className="text-xs text-gray-500 mt-1">
          Available variables: {"{name}"}, {"{email}"}, {"{position}"}, {"{company}"}
        </p>
      </div>
    </>
  );
};
