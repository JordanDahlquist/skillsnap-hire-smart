
import { UnifiedHeader } from '@/components/UnifiedHeader';
import { ScoutChat } from '@/components/scout/ScoutChat';
import { ChatSidebar } from '@/components/scout/ChatSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <UnifiedHeader />
      <div className="flex-1 pt-16 overflow-hidden">
        <SidebarProvider>
          <div className="flex h-full w-full">
            <ChatSidebar
              activeConversationId={activeConversationId}
              onConversationSelect={handleConversationSelect}
              onNewConversation={handleNewConversation}
            />
            <SidebarInset className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0 bg-background">
                <SidebarTrigger />
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-foreground">Scout AI</h1>
                  <p className="text-xs text-muted-foreground">
                    Your intelligent hiring assistant
                  </p>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScoutChat 
                  conversationId={activeConversationId}
                  onConversationUpdate={loadConversations}
                />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default Scout;
