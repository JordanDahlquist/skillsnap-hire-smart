
import { useState, useEffect, useRef } from "react";
import { Send, Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageList } from "./MessageList";
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or thread changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, thread?.id]);

  // Auto-scroll to bottom when selecting a new thread
  useEffect(() => {
    if (thread?.id && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [thread?.id]);

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
      
      // Scroll to bottom after sending reply
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
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
      <CardHeader className="pb-3 border-b flex-shrink-0">
        <CardTitle className="text-lg line-clamp-2">{thread.subject}</CardTitle>
        <p className="text-sm text-gray-600 truncate">
          Conversation with: {participants}
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages with proper scrolling */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="py-4">
              <MessageList messages={messages} />
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} className="h-0" />
            </div>
          </ScrollArea>
        </div>

        {/* Reply Composer - Fixed at bottom */}
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
