
import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto">
      <div className="glass-card p-2 transition-all duration-300 hover:shadow-2xl focus-within:ring-2 focus-within:ring-blue-400/50">
        <div className="flex items-end gap-3">
          {/* Input Area with Glass Effect */}
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Scout anything about your hiring pipeline..."
              disabled={isLoading}
              className="resize-none border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-muted-foreground/70 min-h-[60px] max-h-[120px] text-foreground text-base leading-relaxed p-4 rounded-2xl"
              rows={1}
            />
            
            {/* Floating Placeholder Enhancement */}
            {!message && (
              <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                <Sparkles className="w-4 h-4 text-muted-foreground/50" />
              </div>
            )}
          </div>
          
          {/* Glass Send Button */}
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            className="glass-button-premium h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-muted-foreground/40 disabled:to-muted-foreground/50 rounded-2xl transition-all duration-300 hover:scale-110 shadow-lg"
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>
      
      {/* Enhanced Helper Text */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-4 glass-card-no-hover px-4 py-2 rounded-full">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-white/50 border border-white/30 rounded-lg text-xs font-mono">Enter</kbd>
            <span>to send</span>
          </div>
          <div className="w-px h-4 bg-muted-foreground/30"></div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-white/50 border border-white/30 rounded-lg text-xs font-mono">Shift + Enter</kbd>
            <span>for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
};
