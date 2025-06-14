
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
    <div className="flex-shrink-0 border-t border-border/50 bg-background/30 backdrop-blur-sm">
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Ready to send your email campaign
        </div>
        
        <Button
          onClick={onSend}
          disabled={!canSend || isSending}
          className="glass-button bg-blue-500 hover:bg-blue-600 text-white border-0 px-6 py-2 h-10"
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
