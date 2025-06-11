
import { Plus, MessageSquare, Trash2, X, Loader2 } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Scout AI</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* New Chat Button */}
      <div className="p-4 bg-white border-b border-gray-200">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>
      
      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="w-8 h-8 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 mb-1">No conversations yet</p>
              <p className="text-xs text-gray-400">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={`
                  group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
                  ${activeConversationId === conversation.id 
                    ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                    : 'hover:bg-white hover:shadow-sm'
                  }
                `}
              >
                <div className="flex-shrink-0 mt-1">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </h4>
                    {conversation.isGeneratingTitle && (
                      <Loader2 className="w-3 h-3 text-blue-500 animate-spin flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(conversation.lastMessageAt, { addSuffix: true })}
                  </p>
                </div>
                
                <button
                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
