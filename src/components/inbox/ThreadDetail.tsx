
import { useState, useEffect } from "react";
import { ModernThreadView } from "./ModernThreadView";
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

  // Reset state when thread changes
  useEffect(() => {
    if (thread?.id) {
      setReplyContent("");
      setAttachments([]);
      setShowAttachments(false);
    }
  }, [thread?.id]);

  const handleSendReply = async () => {
    if ((!replyContent.trim() && attachments.length === 0) || isSending || !thread) return;

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

  return (
    <ModernThreadView
      thread={thread}
      messages={messages}
      replyContent={replyContent}
      setReplyContent={setReplyContent}
      attachments={attachments}
      setAttachments={setAttachments}
      showAttachments={showAttachments}
      setShowAttachments={setShowAttachments}
      isSending={isSending}
      onSendReply={handleSendReply}
    />
  );
};
