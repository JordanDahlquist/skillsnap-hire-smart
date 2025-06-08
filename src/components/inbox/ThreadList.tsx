
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EmailThread } from "@/types/inbox";

interface ThreadListProps {
  threads: EmailThread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onMarkAsRead: (threadId: string) => void;
}

export const ThreadList = ({
  threads,
  selectedThreadId,
  onSelectThread,
  onMarkAsRead
}: ThreadListProps) => {
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-lg font-medium">No messages yet</p>
        <p className="text-sm">Your email conversations will appear here</p>
      </div>
    );
  }

  const handleThreadClick = (thread: EmailThread) => {
    onSelectThread(thread.id);
    if (thread.unread_count > 0) {
      onMarkAsRead(thread.id);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {threads.map((thread) => (
        <div
          key={thread.id}
          onClick={() => handleThreadClick(thread)}
          className={cn(
            "p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors",
            selectedThreadId === thread.id && "bg-blue-50 border-blue-200",
            thread.unread_count > 0 && "bg-blue-25"
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className={cn(
              "text-sm truncate flex-1 mr-2",
              thread.unread_count > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"
            )}>
              {thread.subject}
            </h3>
            {thread.unread_count > 0 && (
              <Badge variant="destructive" className="text-xs">
                {thread.unread_count}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="truncate">
              {Array.isArray(thread.participants) 
                ? thread.participants.filter(p => typeof p === 'string').join(', ') 
                : 'No participants'}
            </span>
            <span className="ml-2 whitespace-nowrap">
              {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
