
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { extractSenderName } from "@/utils/emailSenderUtils";
import type { EmailThread } from "@/types/inbox";

interface ProcessedThread extends EmailThread {
  processedSubject: string;
}

interface ThreadListProps {
  threads: ProcessedThread[];
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
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
        <p className="text-lg font-medium">No messages found</p>
        <p className="text-sm">Try adjusting your search or check back later</p>
      </div>
    );
  }

  const handleThreadClick = (thread: ProcessedThread) => {
    onSelectThread(thread.id);
    
    if (thread.unread_count > 0) {
      onMarkAsRead(thread.id);
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {threads.map((thread) => {
        // Use processed subject or fall back to original
        const displaySubject = thread.processedSubject || thread.subject;
        
        // Get participant names (excluding current user's email)
        const participants = Array.isArray(thread.participants) 
          ? thread.participants.filter(p => 
              typeof p === 'string' && 
              !p.includes('inbound.atract.ai')
            )
          : [];

        const participantDisplay = participants.length > 0 
          ? participants.map(email => {
              return extractSenderName(email);
            }).join(', ')
          : 'No participants';

        return (
          <div
            key={thread.id}
            onClick={() => handleThreadClick(thread)}
            className={cn(
              "p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4",
              selectedThreadId === thread.id 
                ? "bg-blue-50 border-l-blue-500" 
                : "border-l-transparent",
              thread.unread_count > 0 && "bg-blue-25"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className={cn(
                "text-sm truncate flex-1 mr-2 leading-tight",
                thread.unread_count > 0 
                  ? "font-semibold text-gray-900" 
                  : "font-medium text-gray-700"
              )}>
                {displaySubject || 'No Subject'}
              </h3>
              {thread.unread_count > 0 && (
                <Badge variant="destructive" className="text-xs flex-shrink-0 ml-2">
                  {thread.unread_count}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="truncate flex-1 mr-2 font-medium">
                {participantDisplay}
              </span>
              <span className="whitespace-nowrap flex-shrink-0">
                {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
