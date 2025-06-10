
import React from 'react';
import { formatDistanceToNow } from "date-fns";
import { Mail, MailOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { EmailThread } from "@/types/inbox";

interface ModernThreadListProps {
  threads: EmailThread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onMarkAsRead: (threadId: string) => void;
}

export const ModernThreadList = ({
  threads,
  selectedThreadId,
  onSelectThread,
  onMarkAsRead
}: ModernThreadListProps) => {
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-6">
        <Mail className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No conversations</p>
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

  const getInitials = (participants: string[] | any) => {
    if (!Array.isArray(participants) || participants.length === 0) return "?";
    const email = participants.find(p => typeof p === 'string') || "";
    return email.charAt(0).toUpperCase();
  };

  const getDisplayName = (participants: string[] | any) => {
    if (!Array.isArray(participants) || participants.length === 0) return "Unknown";
    const email = participants.find(p => typeof p === 'string') || "";
    return email.split('@')[0];
  };

  return (
    <div className="flex flex-col h-full">
      {threads.map((thread) => (
        <div
          key={thread.id}
          onClick={() => handleThreadClick(thread)}
          className={cn(
            "flex items-start gap-3 p-4 cursor-pointer border-b border-border/50 hover:bg-accent/50 transition-colors relative",
            selectedThreadId === thread.id && "bg-accent border-r-2 border-r-primary",
            thread.unread_count > 0 && "bg-blue-50/30"
          )}
        >
          {/* Avatar */}
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="text-sm font-medium">
              {getInitials(thread.participants)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className={cn(
                "text-sm font-medium truncate",
                thread.unread_count > 0 ? "text-foreground" : "text-muted-foreground"
              )}>
                {getDisplayName(thread.participants)}
              </span>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
                </span>
                {thread.unread_count > 0 && (
                  <Badge variant="default" className="h-5 min-w-[1.25rem] text-xs">
                    {thread.unread_count}
                  </Badge>
                )}
              </div>
            </div>

            <h3 className={cn(
              "text-sm mb-1 line-clamp-1",
              thread.unread_count > 0 ? "font-semibold text-foreground" : "font-normal text-muted-foreground"
            )}>
              {thread.subject}
            </h3>
          </div>

          {/* Unread indicator */}
          {thread.unread_count > 0 && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
          )}
        </div>
      ))}
    </div>
  );
};
