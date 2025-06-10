
import { useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConversationContainer } from "./ConversationContainer";
import { EmailRichTextEditor } from "./EmailRichTextEditor";
import { AttachmentUpload } from "./AttachmentUpload";
import type { EmailThread, EmailMessage } from "@/types/inbox";

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

interface ThreadDetailProps {
  thread: EmailThread | null;
  messages: EmailMessage[];
  onSendReply: (threadId: string, content: string, attachments?: AttachmentFile[]) => Promise<void>;
  onMarkAsRead: (threadId: string) => void;
}

export const ThreadDetail = ({
  thread,
  messages,
  onSendReply,
  onMarkAsRead
}: ThreadDetailProps) => {
  const [replyContent, setReplyContent] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

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
    if ((!replyContent.trim() && attachments.length === 0) || isSending) return;

    setIsSending(true);
    try {
      await onSendReply(thread.id, replyContent, attachments);
      setReplyContent("");
      setAttachments([]);
      setShowAttachments(false);
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  const participants = Array.isArray(thread.participants)
    ? thread.participants.filter(p => typeof p === 'string').join(', ')
    : 'No participants';

  const hasContent = replyContent.trim() || attachments.length > 0;

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

            {/* Attachment Toggle */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAttachments(!showAttachments)}
                disabled={isSending}
                className="flex items-center gap-2"
              >
                <Paperclip className="w-4 h-4" />
                Attachments {attachments.length > 0 && `(${attachments.length})`}
              </Button>
            </div>

            {/* Attachments */}
            {showAttachments && (
              <AttachmentUpload
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                disabled={isSending}
              />
            )}

            {/* Send Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSendReply}
                disabled={!hasContent || isSending}
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
