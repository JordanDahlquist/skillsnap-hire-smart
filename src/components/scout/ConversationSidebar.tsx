
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
      {/* Header with Glass Effect */}
      <div className="flex items-center justify-between p-6 border-b border-white/20">
        <div>
          <h2 className="text-xl font-bold text-foreground">Scout AI</h2>
          <p className="text-sm text-muted-foreground">Your hiring assistant</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden glass-button p-2 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* New Chat Button with Glass Effect */}
      <div className="p-4">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-3 glass-button bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl h-12 hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </Button>
      </div>
      
      {/* Conversations List with Glass Cards */}
      <ScrollArea className="flex-1">
        <div className="px-4 pb-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass-card-no-hover h-20 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="glass-card-no-hover w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">No conversations yet</p>
              <p className="text-xs text-muted-foreground/80">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={`
                  group glass-card cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                  ${activeConversationId === conversation.id 
                    ? 'ring-2 ring-blue-400/50 bg-gradient-to-r from-blue-50/80 to-purple-50/80' 
                    : ''
                  }
                `}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate mb-1">
                      {conversation.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {formatDistanceToNow(conversation.lastMessageAt, { addSuffix: true })}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                    className="opacity-0 group-hover:opacity-100 glass-button p-2 rounded-lg hover:bg-red-100/50 hover:text-red-600 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
