
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
    <div className="h-full relative overflow-hidden bg-background">
      {/* Messages area - takes all available space minus input height */}
      <div className="absolute inset-0 bottom-0 pb-32">
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          scrollAreaRef={scrollAreaRef}
          messagesContainerRef={messagesContainerRef}
        />
      </div>
      
      {/* Fixed input at bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t bg-background z-10">
        <ChatInput
          onSubmit={onSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
