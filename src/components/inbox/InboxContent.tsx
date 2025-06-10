
import { useState } from "react";
import { ModernInboxHeader } from "./ModernInboxHeader";
import { ModernThreadList } from "./ModernThreadList";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EmailThread } from "@/types/inbox";

interface InboxContentProps {
  threads: EmailThread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onMarkAsRead: (threadId: string) => void;
  onRefresh: () => void;
}

export const InboxContent = ({
  threads,
  selectedThreadId,
  onSelectThread,
  onMarkAsRead,
  onRefresh
}: InboxContentProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredThreads = threads.filter(thread =>
    thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.participants.some(p => 
      typeof p === 'string' ? p.toLowerCase().includes(searchTerm.toLowerCase()) : false
    )
  );

  const totalUnread = threads.reduce((sum, thread) => sum + thread.unread_count, 0);

  return (
    <div className="h-full flex flex-col bg-background">
      <ModernInboxHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={onRefresh}
        totalUnread={totalUnread}
      />
      
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <ModernThreadList
            threads={filteredThreads}
            selectedThreadId={selectedThreadId}
            onSelectThread={onSelectThread}
            onMarkAsRead={onMarkAsRead}
          />
        </ScrollArea>
      </div>
    </div>
  );
};
