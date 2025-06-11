
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
    <div className="h-full grid grid-rows-[1fr_auto] overflow-hidden bg-background">
      {/* Messages area - takes all available space */}
      <div className="overflow-hidden">
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          scrollAreaRef={scrollAreaRef}
          messagesContainerRef={messagesContainerRef}
        />
      </div>
      
      {/* Fixed input at bottom */}
      <div className="border-t bg-background">
        <ChatInput
          onSubmit={onSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
