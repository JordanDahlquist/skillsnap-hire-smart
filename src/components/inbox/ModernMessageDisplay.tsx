
import React, { useState } from 'react';
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Download, File, Image, FileText, MoreHorizontal } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { parseEmailContent, truncateContent } from '@/utils/emailContentParser';
import type { EmailMessage } from "@/types/inbox";

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface ModernMessageDisplayProps {
  message: EmailMessage & { attachments?: Attachment[] };
  isLast?: boolean;
}

export const ModernMessageDisplay = ({ message, isLast = false }: ModernMessageDisplayProps) => {
  const [showQuotedContent, setShowQuotedContent] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Parse the email content
  const parsedContent = parseEmailContent(message.content);
  const { cleanContent, hasQuotedReply, quotedContent } = parsedContent;
  
  // Determine if content should be truncated
  const shouldTruncate = cleanContent.length > 600;
  const displayContent = showFullContent ? cleanContent : truncateContent(cleanContent, 600);
  
  const attachments = message.attachments || [];
  const senderName = message.sender_email.split('@')[0];
  const isOutbound = message.direction === 'outbound';

  return (
    <div className={cn("border-b border-border/30 bg-background", isLast && "border-b-0")}>
      {/* Message Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs">
              {isOutbound ? 'Me' : senderName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {isOutbound ? 'You' : senderName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Reply</DropdownMenuItem>
            <DropdownMenuItem>Forward</DropdownMenuItem>
            <DropdownMenuItem>Mark as spam</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Message Content */}
      <div className="px-4 pb-4">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
            {displayContent}
          </div>
          
          {/* Show more/less button for long content */}
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullContent(!showFullContent)}
              className="mt-2 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              {showFullContent ? (
                <div className="flex items-center gap-1">
                  <ChevronUp className="w-3 h-3" />
                  Show less
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <ChevronDown className="w-3 h-3" />
                  Show more
                </div>
              )}
            </Button>
          )}

          {/* Quoted/Previous content */}
          {hasQuotedReply && quotedContent && (
            <div className="mt-4 pt-3 border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuotedContent(!showQuotedContent)}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground mb-2"
              >
                {showQuotedContent ? (
                  <div className="flex items-center gap-1">
                    <ChevronUp className="w-3 h-3" />
                    Hide quoted text
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <ChevronDown className="w-3 h-3" />
                    Show quoted text
                  </div>
                )}
              </Button>
              
              {showQuotedContent && (
                <div className="text-xs text-muted-foreground whitespace-pre-wrap p-3 bg-muted/30 rounded border border-border/30">
                  {quotedContent}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/30">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Attachments ({attachments.length})
            </div>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border/30"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(attachment.type)}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">
                        {attachment.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    className="h-6 w-6 p-0"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
