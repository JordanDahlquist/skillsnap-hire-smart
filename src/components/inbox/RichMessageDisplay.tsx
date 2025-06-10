
import React from 'react';
import { formatDistanceToNow } from "date-fns";
import { Download, File, Image, FileText } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import type { EmailMessage } from "@/types/inbox";

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface RichMessageDisplayProps {
  message: EmailMessage & { attachments?: Attachment[] };
}

export const RichMessageDisplay = ({ message }: RichMessageDisplayProps) => {
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

  const isRichContent = message.content.includes('<') || message.content.includes('&');
  const attachments = message.attachments || [];

  return (
    <div
      className={cn(
        "p-4 rounded-lg max-w-[85%] shadow-sm border",
        message.direction === 'outbound'
          ? "ml-auto bg-primary text-primary-foreground"
          : "mr-auto bg-muted"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-sm font-medium",
          message.direction === 'outbound' ? "text-primary-foreground/90" : "text-muted-foreground"
        )}>
          {message.direction === 'outbound' ? 'You' : message.sender_email}
        </span>
        <span className={cn(
          "text-xs",
          message.direction === 'outbound' ? "text-primary-foreground/70" : "text-muted-foreground/70"
        )}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
      </div>
      
      {/* Message Content */}
      <div className="text-sm mb-3 leading-relaxed">
        {isRichContent ? (
          <div 
            dangerouslySetInnerHTML={{ __html: message.content }}
            className={cn(
              "prose prose-sm max-w-none",
              message.direction === 'outbound' 
                ? "prose-invert" 
                : ""
            )}
          />
        ) : (
          <div className="whitespace-pre-wrap">
            {message.content}
          </div>
        )}
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-opacity-20">
          <div className={cn(
            "text-xs font-medium",
            message.direction === 'outbound' ? "text-primary-foreground/90" : "text-muted-foreground"
          )}>
            Attachments ({attachments.length})
          </div>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className={cn(
                "flex items-center justify-between p-2 rounded border border-opacity-20 bg-opacity-50",
                message.direction === 'outbound' 
                  ? "bg-primary-foreground/10" 
                  : "bg-background"
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getFileIcon(attachment.type)}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">
                    {attachment.name}
                  </div>
                  <div className={cn(
                    "text-xs",
                    message.direction === 'outbound' ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {formatFileSize(attachment.size)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(attachment)}
                className={cn(
                  "h-6 w-6 p-0",
                  message.direction === 'outbound' 
                    ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
