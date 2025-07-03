
import { ScoutChat } from './ScoutChat';

interface MainChatAreaProps {
  conversationId: string | null;
  onConversationChange?: (conversationId: string) => void;
}

export const MainChatArea = ({ conversationId }: MainChatAreaProps) => {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#ffffff' }}>
      <ScoutChat
        conversationId={conversationId}
        onConversationUpdate={() => {}}
      />
    </div>
  );
};
