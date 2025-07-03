
import { useState } from "react";
import { Send, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConversationContainer } from "./ConversationContainer";
import { EmailRichTextEditor } from "./EmailRichTextEditor";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import type { EmailThread, EmailMessage } from "@/types/inbox";

interface ThreadDetailProps {
  thread: EmailThread | null;
  messages: EmailMessage[];
  onSendReply: (threadId: string, content: string) => Promise<void>;
  onMarkAsRead: (threadId: string) => void;
  // Archive operations
  onArchiveThread?: (threadId: string) => void;
  onUnarchiveThread?: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => void;
}

export const ThreadDetail = ({
  thread,
  messages,
  onSendReply,
  onMarkAsRead,
  onArchiveThread,
  onUnarchiveThread,
  onDeleteThread
}: ThreadDetailProps) => {
  const [replyContent, setReplyContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (onDeleteThread) {
      onDeleteThread(thread.id);
    }
  };

  const participants = Array.isArray(thread.participants)
    ? thread.participants.filter(p => typeof p === 'string').join(', ')
    : 'No participants';

  const hasContent = replyContent.trim();
  const isArchived = thread.status === 'archived';

  return (
    <Card className="h-full flex flex-col">
      {/* Fixed Header */}
      <CardHeader className="pb-3 border-b flex-shrink-0 bg-background">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate flex items-center gap-2">
              {thread.subject}
              {isArchived && (
                <Archive className="w-4 h-4 text-gray-500" />
              )}
            </CardTitle>
            <p className="text-sm text-gray-600 truncate">
              Conversation with: {participants}
            </p>
          </div>
          
          {/* Thread Actions */}
          <div className="flex items-center gap-2 ml-4">
            {isArchived ? (
              onUnarchiveThread && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUnarchiveThread(thread.id)}
                >
                  <ArchiveRestore className="w-4 h-4 mr-1" />
                  Unarchive
                </Button>
              )
            ) : (
              onArchiveThread && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onArchiveThread(thread.id)}
                >
                  <Archive className="w-4 h-4 mr-1" />
                  Archive
                </Button>
              )
            )}
            
            {onDeleteThread && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteClick}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 flex flex-col p-0">
        {/* Messages Container - Independent Scrolling */}
        <div className="flex-1 min-h-0">
          <ConversationContainer 
            messages={messages} 
            className="h-full"
          />
        </div>

        {/* Fixed Reply Composer - Hide if archived */}
        {!isArchived && (
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
        )}
      </CardContent>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        threadCount={1}
        messageCount={messages.length}
      />
    </Card>
  );
};
