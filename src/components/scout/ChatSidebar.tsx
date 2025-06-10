
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { ConversationList } from './ConversationList';

interface ChatSidebarProps {
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
}

export const ChatSidebar = ({
  activeConversationId,
  onConversationSelect,
  onNewConversation
}: ChatSidebarProps) => {
  return (
    <Sidebar className="h-full">
      <SidebarHeader className="border-b px-4 py-3 flex-shrink-0">
        <h2 className="text-base font-semibold">Scout AI</h2>
        <p className="text-xs text-muted-foreground">Your hiring assistant</p>
      </SidebarHeader>
      <SidebarContent className="flex-1 min-h-0 overflow-hidden">
        <ConversationList
          activeConversationId={activeConversationId}
          onConversationSelect={onConversationSelect}
          onNewConversation={onNewConversation}
        />
      </SidebarContent>
    </Sidebar>
  );
};
