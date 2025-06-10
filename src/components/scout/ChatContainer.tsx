
import { Card, CardContent } from '@/components/ui/card';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';

interface Message {
  id: string;
  content: string;
  isAi: boolean;
  timestamp: Date;
  jobCards?: any[];
  candidateCards?: any[];
}

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

export const ChatContainer = ({
  messages,
  isLoading,
  onSendMessage,
  scrollAreaRef,
  messagesContainerRef
}: ChatContainerProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <Card className="h-full flex flex-col border-0 shadow-none">
          <CardContent className="flex-1 min-h-0 p-0">
            <ChatMessageList
              messages={messages}
              isLoading={isLoading}
              scrollAreaRef={scrollAreaRef}
              messagesContainerRef={messagesContainerRef}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="flex-shrink-0">
        <ChatInput
          onSubmit={onSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
