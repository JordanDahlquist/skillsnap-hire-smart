
import { RichMessageDisplay } from "./RichMessageDisplay";
import type { EmailMessage } from "@/types/inbox";

interface MessageListProps {
  messages: EmailMessage[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
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
        <RichMessageDisplay key={message.id} message={message} />
      ))}
    </div>
  );
};
