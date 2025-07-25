
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatScroll } from '@/hooks/useChatScroll';
import { ChatContainer } from './ChatContainer';

interface ScoutChatProps {
  conversationId: string | null;
  onConversationUpdate?: () => void;
  startNewConversation?: () => Promise<string | null>;
}

export const ScoutChat = ({ 
  conversationId, 
  onConversationUpdate,
  startNewConversation
}: ScoutChatProps) => {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage } = useChatMessages({
    conversationId,
    onConversationUpdate,
    startNewConversation
  });
  const { scrollAreaRef, messagesContainerRef } = useChatScroll(messages);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please log in to use Scout AI.</p>
      </div>
    );
  }

  return (
    <ChatContainer
      messages={messages}
      isLoading={isLoading}
      onSendMessage={sendMessage}
      scrollAreaRef={scrollAreaRef}
      messagesContainerRef={messagesContainerRef}
    />
  );
};
