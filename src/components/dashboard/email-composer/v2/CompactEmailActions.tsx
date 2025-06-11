
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
    <div className="p-4">
      <div className="flex items-center justify-end">
        {/* Send button */}
        <Button
          onClick={onSend}
          disabled={!canSend || isSending}
          className="h-10 text-sm glass-button-premium text-blue-700 hover:text-blue-800 font-medium"
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
