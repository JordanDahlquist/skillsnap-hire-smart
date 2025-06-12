
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
      <div className="flex items-center justify-center h-full p-8">
        <div className="glass-card text-center p-8 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to Scout AI</h3>
          <p className="text-muted-foreground mb-4">Please log in to start chatting with your AI hiring assistant</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Area with Glass Background */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-4 glass-content rounded-3xl overflow-hidden">
          <MessagesList
            messages={messages}
            isLoading={isLoading}
            scrollAreaRef={scrollAreaRef}
            messagesContainerRef={messagesContainerRef}
          />
        </div>
      </div>
      
      {/* Fixed Input at Bottom */}
      <div className="flex-shrink-0 p-4">
        <ChatInputBox
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
