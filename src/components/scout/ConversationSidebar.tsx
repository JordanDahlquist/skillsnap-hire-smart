
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversations } from '@/hooks/useConversations';
import { formatDistanceToNow } from 'date-fns';

interface ConversationSidebarProps {
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  onClose?: () => void;
}

export const ConversationSidebar = ({
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  onClose
}: ConversationSidebarProps) => {
  const { conversations, isLoading, deleteConversation } = useConversations();

  const handleConversationClick = (conversationId: string) => {
    onConversationSelect(conversationId);
    onClose?.();
  };

  const handleNewChat = () => {
    onNewConversation();
    onClose?.();
  };

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    deleteConversation(conversationId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Scout AI</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground rounded"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-3 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>
      
      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4 space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-1">No conversations yet</p>
              <p className="text-xs text-muted-foreground/80">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={`
                  group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors
                  ${activeConversationId === conversation.id 
                    ? 'bg-accent border border-accent-foreground/20' 
                    : 'hover:bg-muted/50'
                  }
                `}
              >
                <div className="flex-shrink-0 mt-1">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {conversation.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    {formatDistanceToNow(conversation.lastMessageAt, { addSuffix: true })}
                  </p>
                </div>
                
                <button
                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
