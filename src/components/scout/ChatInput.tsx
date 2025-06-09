
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput = ({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Ask Scout anything about your hiring pipeline..."
}: ChatInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit();
  };

  return (
    <div className="sticky bottom-0 bg-background border-t p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div
          className={cn(
            "relative flex items-end gap-3 p-4 rounded-2xl border transition-all duration-200",
            "bg-card shadow-sm",
            isFocused && "shadow-md ring-2 ring-ring ring-opacity-20",
            "hover:shadow-md"
          )}
        >
          <div className="flex-1 min-w-0">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={isLoading}
              className={cn(
                "min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent",
                "placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0",
                "text-base leading-relaxed p-0"
              )}
              rows={3}
            />
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl shrink-0 transition-all duration-200",
              value.trim() && !isLoading
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center mt-3">
          <p className="text-xs text-muted-foreground/60">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">Enter</kbd> to send, 
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded ml-1">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
};
