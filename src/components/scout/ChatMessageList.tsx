
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot } from 'lucide-react';
import { ScoutMessage } from './ScoutMessage';
import { ConversationStarterBubbles } from './ConversationStarterBubbles';

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
  onSendMessage?: (message: string) => void;
}

export const ChatMessageList = ({ 
  messages, 
  isLoading, 
  scrollAreaRef, 
  messagesContainerRef,
  onSendMessage
}: ChatMessageListProps) => {
  return (
    <div className="h-full overflow-hidden" style={{ backgroundColor: '#f2eeeb' }}>
      <ScrollArea className="h-full" ref={scrollAreaRef}>
        <div className="min-h-full" ref={messagesContainerRef} style={{ backgroundColor: '#f2eeeb' }}>
          {messages.length === 0 && !isLoading && onSendMessage && (
            <ConversationStarterBubbles onSendMessage={onSendMessage} />
          )}
          
          {messages.length > 0 && (
            <div className="px-4 py-4 space-y-4">
              {messages.map((message) => (
                <ScoutMessage 
                  key={message.id} 
                  message={message}
                />
              ))}
            </div>
          )}
          
          {isLoading && (
            <div className="px-4 py-4">
              <div className="flex items-center gap-3 text-muted-foreground px-4 py-3 rounded-lg bg-muted/30">
                <Bot className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Scout is thinking...</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
