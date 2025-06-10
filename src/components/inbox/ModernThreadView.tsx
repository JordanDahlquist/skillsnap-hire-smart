
import React, { useEffect, useRef } from 'react';
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModernMessageDisplay } from "./ModernMessageDisplay";
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

interface ModernThreadViewProps {
  thread: EmailThread | null;
  messages: EmailMessage[];
  replyContent: string;
  setReplyContent: (content: string) => void;
  attachments: AttachmentFile[];
  setAttachments: (attachments: AttachmentFile[]) => void;
  showAttachments: boolean;
  setShowAttachments: (show: boolean) => void;
  isSending: boolean;
  onSendReply: () => void;
}

export const ModernThreadView = ({
  thread,
  messages,
  replyContent,
  setReplyContent,
  attachments,
  setAttachments,
  showAttachments,
  setShowAttachments,
  isSending,
  onSendReply
}: ModernThreadViewProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, thread?.id]);

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm">Choose a thread from the list to view messages</p>
        </div>
      </div>
    );
  }

  const hasContent = replyContent.trim() || attachments.length > 0;
  const participants = Array.isArray(thread.participants)
    ? thread.participants.filter(p => typeof p === 'string').join(', ')
    : 'No participants';

  // Sort messages by creation date
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Thread Header */}
      <div className="border-b border-border p-4 bg-background">
        <h2 className="text-lg font-semibold line-clamp-2 mb-1">{thread.subject}</h2>
        <p className="text-sm text-muted-foreground">
          Conversation with: {participants}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="min-h-full">
            {sortedMessages.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>No messages in this conversation</p>
              </div>
            ) : (
              sortedMessages.map((message, index) => (
                <ModernMessageDisplay
                  key={message.id}
                  message={message}
                  isLast={index === sortedMessages.length - 1}
                />
              ))
            )}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} className="h-0" />
          </div>
        </ScrollArea>
      </div>

      {/* Compose Area */}
      <div className="border-t border-border p-4 bg-background">
        <div className="space-y-3">
          {/* Rich Text Editor */}
          <EmailRichTextEditor
            value={replyContent}
            onChange={setReplyContent}
            placeholder="Type your reply..."
            disabled={isSending}
          />

          {/* Attachment Toggle & Send Button Row */}
          <div className="flex items-center justify-between">
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

            <Button
              onClick={onSendReply}
              disabled={!hasContent || isSending}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Sending...' : 'Send Reply'}
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
        </div>
      </div>
    </div>
  );
};
