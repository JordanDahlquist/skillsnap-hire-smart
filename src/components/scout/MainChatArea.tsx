
import { ScoutChat } from './ScoutChat';

interface MainChatAreaProps {
  conversationId: string | null;
  onConversationChange?: (conversationId: string) => void;
  startNewConversation?: () => Promise<string | null>;
}

export const MainChatArea = ({ conversationId, startNewConversation }: MainChatAreaProps) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <ScoutChat
        conversationId={conversationId}
        onConversationUpdate={() => {}}
        startNewConversation={startNewConversation}
      />
    </div>
  );
};
