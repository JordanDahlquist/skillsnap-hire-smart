
import { ScoutChat } from './ScoutChat';

interface MainChatAreaProps {
  conversationId: string | null;
  onConversationChange?: (conversationId: string) => void;
}

export const MainChatArea = ({ conversationId }: MainChatAreaProps) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <ScoutChat
        conversationId={conversationId}
        onConversationUpdate={() => {}}
      />
    </div>
  );
};
