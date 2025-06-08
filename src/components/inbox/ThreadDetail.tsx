
import { useState } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageList } from "./MessageList";
import type { EmailThread, EmailMessage } from "@/types/inbox";

interface ThreadDetailProps {
  thread: EmailThread | null;
  messages: EmailMessage[];
  onSendReply: (threadId: string, content: string) => Promise<void>;
  onMarkAsRead: (threadId: string) => void;
}

export const ThreadDetail = ({
  thread,
  messages,
  onSendReply,
  onMarkAsRead
}: ThreadDetailProps) => {
  const [replyContent, setReplyContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!thread) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-gray-500">
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm">Choose a thread from the list to view messages</p>
        </CardContent>
      </Card>
    );
  }

  const handleSendReply = async () => {
    if (!replyContent.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendReply(thread.id, replyContent);
      setReplyContent("");
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  const participants = Array.isArray(thread.participants)
    ? thread.participants.filter(p => typeof p === 'string').join(', ')
    : 'No participants';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg">{thread.subject}</CardTitle>
        <p className="text-sm text-gray-600">
          Conversation with: {participants}
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList messages={messages} />
        </div>

        {/* Reply Composer */}
        <div className="border-t p-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Type your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSendReply}
                disabled={!replyContent.trim() || isSending}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
