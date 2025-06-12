
import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputBoxProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInputBox = ({ onSendMessage, isLoading }: ChatInputBoxProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim() || isLoading) return;
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="relative flex items-end gap-4 p-4 backdrop-blur-xl bg-background/30 border border-border/40 rounded-3xl shadow-2xl shadow-foreground/5 focus-within:shadow-3xl focus-within:border-border/60 transition-all duration-300">
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-background/10 to-transparent rounded-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Scout anything about your hiring pipeline..."
            disabled={isLoading}
            className="flex-1 resize-none border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-muted-foreground min-h-[24px] max-h-[120px] text-foreground text-lg leading-relaxed"
            rows={1}
          />
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          size="icon"
          className="relative z-10 h-12 w-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:from-muted-foreground/40 disabled:to-muted-foreground/50 rounded-2xl transition-all duration-300 hover:scale-110 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground font-light">
          Press <kbd className="px-2 py-1 bg-background/30 border border-border/40 rounded-lg text-xs backdrop-blur-sm">Enter</kbd> to send, 
          <kbd className="px-2 py-1 bg-background/30 border border-border/40 rounded-lg text-xs backdrop-blur-sm ml-2">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};
