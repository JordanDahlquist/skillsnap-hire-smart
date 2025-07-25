
import { ScoutChat } from './ScoutChat';

interface MainChatAreaProps {
  conversationId: string | null;
  onConversationChange?: (conversationId: string) => void;
  startNewConversation?: () => Promise<string | null>;
  loadConversations?: () => Promise<void>;
}

export const MainChatArea = ({ conversationId, startNewConversation, loadConversations }: MainChatAreaProps) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <ScoutChat
        conversationId={conversationId}
        onConversationUpdate={loadConversations}
        startNewConversation={startNewConversation}
      />
    </div>
  );
};
