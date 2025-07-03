
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
    <div className="h-full flex flex-col overflow-hidden bg-white">
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          scrollAreaRef={scrollAreaRef}
          messagesContainerRef={messagesContainerRef}
          onSendMessage={onSendMessage}
        />
      </div>
      
      <div className="flex-shrink-0 border-t bg-white">
        <ChatInput
          onSubmit={onSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
