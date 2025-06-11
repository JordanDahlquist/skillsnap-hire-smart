
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
      <div className="relative flex items-end gap-4 p-4 backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl shadow-2xl shadow-black/5 focus-within:shadow-3xl focus-within:border-white/60 transition-all duration-300">
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Scout anything about your hiring pipeline..."
            disabled={isLoading}
            className="flex-1 resize-none border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-slate-500 min-h-[24px] max-h-[120px] text-slate-700 text-lg leading-relaxed"
            rows={1}
          />
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          size="icon"
          className="relative z-10 h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 rounded-2xl transition-all duration-300 hover:scale-110 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-slate-500 font-light">
          Press <kbd className="px-2 py-1 bg-white/30 border border-white/40 rounded-lg text-xs backdrop-blur-sm">Enter</kbd> to send, 
          <kbd className="px-2 py-1 bg-white/30 border border-white/40 rounded-lg text-xs backdrop-blur-sm ml-2">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};
