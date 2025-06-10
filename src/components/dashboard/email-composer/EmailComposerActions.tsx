
import { Button } from '@/components/ui/button';
import { Send, Eye } from 'lucide-react';

interface EmailComposerActionsProps {
  onSend: () => void;
  onTogglePreview: () => void;
  isSending: boolean;
  canSend: boolean;
  showPreview: boolean;
}

export const EmailComposerActions = ({
  onSend,
  onTogglePreview,
  isSending,
  canSend,
  showPreview
}: EmailComposerActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button onClick={onSend} disabled={!canSend || isSending}>
        <Send className="w-4 h-4 mr-2" />
        {isSending ? 'Sending...' : 'Send Email'}
      </Button>
      <Button variant="outline" onClick={onTogglePreview}>
        <Eye className="w-4 h-4 mr-2" />
        {showPreview ? 'Hide Preview' : 'Preview'}
      </Button>
    </div>
  );
};
