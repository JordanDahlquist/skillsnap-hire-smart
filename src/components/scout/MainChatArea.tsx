
import { ScoutChat } from './ScoutChat';

interface MainChatAreaProps {
  conversationId: string | null;
  onConversationChange?: (conversationId: string) => void;
}

export const MainChatArea = ({ conversationId, onConversationChange }: MainChatAreaProps) => {
  return (
    <div className="flex flex-col h-full">
      <ScoutChat
        conversationId={conversationId}
        onConversationUpdate={() => {}}
        onConversationChange={onConversationChange}
      />
    </div>
  );
};
