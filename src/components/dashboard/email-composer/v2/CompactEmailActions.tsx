
import { Button } from '@/components/ui/button';
import { Send, Eye, EyeOff, Loader2 } from 'lucide-react';

interface CompactEmailActionsProps {
  onSend: () => void;
  onTogglePreview: () => void;
  isSending: boolean;
  canSend: boolean;
  showPreview: boolean;
}

export const CompactEmailActions = ({
  onSend,
  onTogglePreview,
  isSending,
  canSend,
  showPreview
}: CompactEmailActionsProps) => {
  return (
    <div className="p-3 bg-gray-50/30">
      <div className="flex items-center justify-between">
        {/* Left side - Preview toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
          className="h-8"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Preview
            </>
          )}
        </Button>

        {/* Right side - Send button */}
        <Button
          onClick={onSend}
          disabled={!canSend || isSending}
          className="h-8 bg-blue-600 hover:bg-blue-700"
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
