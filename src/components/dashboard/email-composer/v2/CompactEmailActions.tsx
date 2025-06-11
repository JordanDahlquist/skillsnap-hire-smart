
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
    <div className="p-2 bg-gray-50/20">
      <div className="flex items-center justify-between">
        {/* Left side - Preview toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
          className="h-7 text-xs"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-3 h-3 mr-1" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 mr-1" />
              Show Preview
            </>
          )}
        </Button>

        {/* Right side - Send button */}
        <Button
          onClick={onSend}
          disabled={!canSend || isSending}
          className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
        >
          {isSending ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-3 h-3 mr-1" />
              Send Email
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
