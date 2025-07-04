
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { extractSenderName } from "@/utils/emailSenderUtils";
import { ThreadActionsMenu } from "./ThreadActionsMenu";
import { Archive } from "lucide-react";
import type { EmailThread } from "@/types/inbox";

interface ProcessedThread extends EmailThread {
  processedSubject: string;
}

interface ThreadListProps {
  threads: ProcessedThread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onMarkAsRead: (threadId: string) => void;
  // Selection props
  selectedThreadIds?: string[];
  onToggleThreadSelection?: (threadId: string) => void;
  // Archive operations
  onArchiveThread?: (threadId: string) => void;
  onUnarchiveThread?: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => void;
}

export const ThreadList = ({
  threads,
  selectedThreadId,
  onSelectThread,
  onMarkAsRead,
  selectedThreadIds = [],
  onToggleThreadSelection,
  onArchiveThread,
  onUnarchiveThread,
  onDeleteThread
}: ThreadListProps) => {
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-4">
        <p className="text-lg font-medium">No messages found</p>
        <p className="text-sm">Try adjusting your search or check back later</p>
      </div>
    );
  }

  const handleThreadClick = (thread: ProcessedThread, event: React.MouseEvent) => {
    // Don't select thread if clicking on checkbox
    if ((event.target as HTMLElement).closest('[data-checkbox]')) {
      return;
    }
    
    onSelectThread(thread.id);
    
    if (thread.unread_count > 0) {
      onMarkAsRead(thread.id);
    }
  };

  const showSelection = onToggleThreadSelection && (selectedThreadIds.length > 0 || threads.some(t => selectedThreadIds.includes(t.id)));

  return (
    <div className="divide-y divide-border">
      {threads.map((thread) => {
        const displaySubject = thread.processedSubject || thread.subject;
        const isArchived = thread.status === 'archived';
        const isBulkSelected = selectedThreadIds.includes(thread.id);
        const isActiveThread = selectedThreadId === thread.id;
        
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

        const threadContent = (
          <div
            onClick={(e) => handleThreadClick(thread, e)}
            className={cn(
              "p-4 cursor-pointer transition-colors flex items-center gap-3 relative",
              // Active thread: Dark blue background with white text
              isActiveThread && "bg-blue-600 text-white hover:bg-blue-700",
              // Bulk selected (but not active): Light accent background
              !isActiveThread && isBulkSelected && "bg-accent/80",
              // Unread threads (but not active or bulk selected): Subtle background
              !isActiveThread && !isBulkSelected && thread.unread_count > 0 && "bg-accent/30",
              // Default hover state (only if not active)
              !isActiveThread && "hover:bg-muted/50",
              // Archived threads: Reduced opacity
              isArchived && "opacity-60"
            )}
          >
            {showSelection && onToggleThreadSelection && (
              <div data-checkbox onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isBulkSelected}
                  onCheckedChange={() => onToggleThreadSelection(thread.id)}
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h3 className={cn(
                    "text-sm truncate flex-1 mr-2 leading-tight",
                    thread.unread_count > 0 
                      ? "font-semibold" 
                      : "font-medium",
                    // Text color based on selection state
                    isActiveThread 
                      ? "text-white" 
                      : thread.unread_count > 0 
                        ? "text-foreground" 
                        : "text-muted-foreground"
                  )}>
                    {displaySubject || 'No Subject'}
                  </h3>
                  {isArchived && (
                    <Archive className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isActiveThread ? "text-blue-200" : "text-muted-foreground"
                    )} />
                  )}
                </div>
                {thread.unread_count > 0 && (
                  <Badge variant="destructive" className="text-xs flex-shrink-0 ml-2">
                    {thread.unread_count}
                  </Badge>
                )}
              </div>
              
              <div className={cn(
                "flex items-center justify-between text-xs",
                isActiveThread ? "text-blue-100" : "text-muted-foreground"
              )}>
                <span className="truncate flex-1 mr-2 font-medium">
                  {participantDisplay}
                </span>
                <span className="whitespace-nowrap flex-shrink-0">
                  {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        );

        // Wrap with context menu if actions are provided
        if (onArchiveThread && onUnarchiveThread && onDeleteThread) {
          return (
            <ThreadActionsMenu
              key={thread.id}
              thread={thread}
              onArchive={onArchiveThread}
              onUnarchive={onUnarchiveThread}
              onDelete={onDeleteThread}
            >
              {threadContent}
            </ThreadActionsMenu>
          );
        }

        return (
          <div key={thread.id}>
            {threadContent}
          </div>
        );
      })}
    </div>
  );
};
