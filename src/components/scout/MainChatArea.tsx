
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatScroll } from '@/hooks/useChatScroll';
import { MessagesList } from './MessagesList';
import { ChatInputBox } from './ChatInputBox';

interface MainChatAreaProps {
  conversationId: string | null;
}

export const MainChatArea = ({ conversationId }: MainChatAreaProps) => {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage } = useChatMessages({
    conversationId,
    onConversationUpdate: () => {}
  });
  const { scrollAreaRef, messagesContainerRef } = useChatScroll(messages);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to use Scout AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <MessagesList
          messages={messages}
          isLoading={isLoading}
          scrollAreaRef={scrollAreaRef}
          messagesContainerRef={messagesContainerRef}
        />
      </div>
      
      {/* Fixed Input at Bottom */}
      <div className="border-t border-gray-200 bg-white">
        <ChatInputBox
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
