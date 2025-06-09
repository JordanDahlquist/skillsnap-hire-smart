
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
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <h2 className="text-lg font-semibold">Scout AI</h2>
        <p className="text-sm text-muted-foreground">Your hiring assistant</p>
      </SidebarHeader>
      <SidebarContent>
        <ConversationList
          activeConversationId={activeConversationId}
          onConversationSelect={onConversationSelect}
          onNewConversation={onNewConversation}
        />
      </SidebarContent>
    </Sidebar>
  );
};
