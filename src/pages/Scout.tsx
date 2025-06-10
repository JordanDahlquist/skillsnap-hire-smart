
import { UnifiedHeader } from '@/components/UnifiedHeader';
import { ScoutChat } from '@/components/scout/ScoutChat';
import { ChatSidebar } from '@/components/scout/ChatSidebar';
import { Footer } from '@/components/Footer';
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
      // Reload conversations to update the sidebar immediately
      loadConversations();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <UnifiedHeader />
      <div className="flex-1 flex flex-col">
        <SidebarProvider>
          <div className="flex h-[calc(100vh-4rem)] w-full">
            <ChatSidebar
              activeConversationId={activeConversationId}
              onConversationSelect={handleConversationSelect}
              onNewConversation={handleNewConversation}
            />
            <SidebarInset className="flex flex-col">
              <div className="flex items-center gap-2 p-4 border-b">
                <SidebarTrigger />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">Scout AI</h1>
                  <p className="text-sm text-muted-foreground">
                    Your intelligent hiring assistant
                  </p>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <ScoutChat 
                  conversationId={activeConversationId}
                  onConversationUpdate={loadConversations}
                />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
      <Footer />
    </div>
  );
};

export default Scout;
