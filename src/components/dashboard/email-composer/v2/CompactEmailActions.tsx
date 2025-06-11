
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface CompactEmailActionsProps {
  onSend: () => void;
  isSending: boolean;
  canSend: boolean;
}

export const CompactEmailActions = ({
  onSend,
  isSending,
  canSend
}: CompactEmailActionsProps) => {
  return (
    <div className="p-2">
      <div className="flex items-center justify-end">
        {/* Send button */}
        <Button
          onClick={onSend}
          disabled={!canSend || isSending}
          className="h-7 text-xs glass-button shadow-glow-blue hover:shadow-glow-blue border-0"
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
