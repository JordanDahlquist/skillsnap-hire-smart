
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatScroll } from '@/hooks/useChatScroll';
import { ChatContainer } from './ChatContainer';
import { useEffect } from 'react';

interface ScoutChatProps {
  conversationId: string | null;
  onConversationUpdate?: () => void;
  onConversationChange?: (conversationId: string) => void;
}

export const ScoutChat = ({ 
  conversationId, 
  onConversationUpdate,
  onConversationChange 
}: ScoutChatProps) => {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, conversationId: activeConversationId } = useChatMessages({
    conversationId,
    onConversationUpdate
  });
  const { scrollAreaRef, messagesContainerRef } = useChatScroll(messages);

  // Notify parent when conversation ID changes (e.g., auto-created)
  useEffect(() => {
    if (activeConversationId && activeConversationId !== conversationId) {
      onConversationChange?.(activeConversationId);
    }
  }, [activeConversationId, conversationId, onConversationChange]);

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
