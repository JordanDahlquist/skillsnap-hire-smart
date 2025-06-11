
import { UnifiedHeader } from '@/components/UnifiedHeader';
import { NewChatLayout } from '@/components/scout/NewChatLayout';
import { useActiveConversation } from '@/hooks/useActiveConversation';
import { useConversations } from '@/hooks/useConversations';

const Scout = () => {
  const { activeConversationId, setActiveConversation, startNewConversation } = useActiveConversation();
  const { loadConversations } = useConversations();

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
  };

  const handleNewConversation = async () => {
    const newId = await startNewConversation();
    if (newId) {
      loadConversations();
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <UnifiedHeader />
      <div className="flex-1 min-h-0 overflow-hidden">
        <NewChatLayout
          activeConversationId={activeConversationId}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />
      </div>
    </div>
  );
};

export default Scout;
