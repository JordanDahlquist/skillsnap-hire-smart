
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
    <div className="max-w-3xl mx-auto p-4">
      <div className="relative flex items-end gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:shadow-md focus-within:border-blue-300 transition-all">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Scout anything about your hiring pipeline..."
          disabled={isLoading}
          className="flex-1 resize-none border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-gray-500 min-h-[20px] max-h-[120px]"
          rows={1}
        />
        
        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          size="icon"
          className="h-8 w-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">Enter</kbd> to send, 
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs ml-1">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};
