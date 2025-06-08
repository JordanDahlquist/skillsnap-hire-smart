
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { EmailMessage } from "@/types/inbox";

interface MessageListProps {
  messages: EmailMessage[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No messages in this conversation</p>
      </div>
    );
  }

  // Sort messages by creation date
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedMessages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "p-4 rounded-lg max-w-[80%]",
            message.direction === 'outbound'
              ? "ml-auto bg-blue-600 text-white"
              : "mr-auto bg-gray-100 text-gray-900"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={cn(
              "text-sm font-medium",
              message.direction === 'outbound' ? "text-blue-100" : "text-gray-600"
            )}>
              {message.direction === 'outbound' ? 'You' : message.sender_email}
            </span>
            <span className={cn(
              "text-xs",
              message.direction === 'outbound' ? "text-blue-200" : "text-gray-500"
            )}>
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
};
