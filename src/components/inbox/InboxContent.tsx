
import { useState } from "react";
import { Search, RefreshCw, Mail, MailOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThreadList } from "./ThreadList";
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Inbox
            {totalUnread > 0 && (
              <Badge variant="destructive">{totalUnread}</Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ThreadList
          threads={filteredThreads}
          selectedThreadId={selectedThreadId}
          onSelectThread={onSelectThread}
          onMarkAsRead={onMarkAsRead}
        />
      </CardContent>
    </Card>
  );
};
