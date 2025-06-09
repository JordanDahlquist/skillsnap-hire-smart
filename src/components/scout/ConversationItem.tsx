
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/hooks/useConversations';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export const ConversationItem = ({ 
  conversation, 
  isActive, 
  onClick, 
  onDelete 
}: ConversationItemProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
        isActive && "bg-accent"
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-1">
        <MessageCircle className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{conversation.title}</h4>
        <p className="text-xs text-muted-foreground truncate mt-1">
          {conversation.lastMessage}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(conversation.lastMessageAt, { addSuffix: true })}
        </p>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        onClick={handleDelete}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
};
