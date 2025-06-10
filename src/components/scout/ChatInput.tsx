
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput = ({
  onSubmit,
  isLoading = false,
  placeholder = "Ask Scout anything about your hiring pipeline..."
}: ChatInputProps) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
    setValue('');
  };

  return (
    <div className="bg-background p-3">
      <div className="max-w-4xl mx-auto">
        <div
          className={cn(
            "relative flex items-end gap-2 p-2 rounded-xl border transition-all duration-200",
            "bg-card shadow-sm",
            isFocused && "shadow-md ring-1 ring-ring ring-opacity-20"
          )}
        >
          <div className="flex-1 min-w-0">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={isLoading}
              className={cn(
                "min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent",
                "placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0",
                "text-sm leading-relaxed p-0"
              )}
              rows={1}
            />
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg shrink-0 transition-all duration-200",
              value.trim() && !isLoading
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center mt-1">
          <p className="text-xs text-muted-foreground/60">
            <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded">Enter</kbd> to send, 
            <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded ml-1">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
};
