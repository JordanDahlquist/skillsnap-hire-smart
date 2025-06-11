
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot } from 'lucide-react';
import { ScoutMessage } from './ScoutMessage';

interface Message {
  id: string;
  content: string;
  isAi: boolean;
  timestamp: Date;
  jobCards?: any[];
  candidateCards?: any[];
}

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessageList = ({ 
  messages, 
  isLoading, 
  scrollAreaRef, 
  messagesContainerRef 
}: ChatMessageListProps) => {
  return (
    <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
      <div className="px-4 py-4 space-y-4 min-h-full pb-8" ref={messagesContainerRef}>
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-center min-h-[400px]">
            <div className="max-w-md">
              <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Welcome to Scout AI
              </h3>
              <p className="text-sm text-muted-foreground">
                Your intelligent hiring assistant is ready to help. Ask me anything about your hiring pipeline, candidates, or recruitment strategies.
              </p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <ScoutMessage 
            key={message.id} 
            message={message}
          />
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-3 text-muted-foreground px-4 py-3 rounded-lg bg-muted/30">
            <Bot className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Scout is thinking...</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
