
import { useState } from "react";
import { Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConversationContainer } from "./ConversationContainer";
import { EmailRichTextEditor } from "./EmailRichTextEditor";
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

  const hasContent = replyContent.trim();

  return (
    <Card className="h-full flex flex-col">
      {/* Fixed Header */}
      <CardHeader className="pb-3 border-b flex-shrink-0 bg-background">
        <CardTitle className="text-lg truncate">{thread.subject}</CardTitle>
        <p className="text-sm text-gray-600 truncate">
          Conversation with: {participants}
        </p>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 flex flex-col p-0">
        {/* Messages Container - Independent Scrolling */}
        <div className="flex-1 min-h-0">
          <ConversationContainer 
            messages={messages} 
            className="h-full"
          />
        </div>

        {/* Fixed Reply Composer */}
        <div className="border-t p-4 flex-shrink-0 bg-background">
          <div className="space-y-3">
            {/* Rich Text Editor */}
            <EmailRichTextEditor
              value={replyContent}
              onChange={setReplyContent}
              placeholder="Type your reply..."
              disabled={isSending}
            />

            {/* Send Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSendReply}
                disabled={!hasContent || isSending}
                size="sm"
                variant="solid"
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
