
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
        "p-4 rounded-lg max-w-[80%]",
        message.direction === 'outbound'
          ? "ml-auto bg-blue-600 text-white"
          : "mr-auto bg-gray-100 text-gray-900"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-sm font-medium",
          message.direction === 'outbound' ? "text-blue-100" : "text-gray-600"
        )}>
          {message.direction === 'outbound' ? 'You' : message.sender_email}
        </span>
        <span className={cn(
          "text-xs",
          message.direction === 'outbound' ? "text-blue-200" : "text-gray-500"
        )}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
      </div>
      
      {/* Message Content */}
      <div className="text-sm mb-3">
        {isRichContent ? (
          <div 
            dangerouslySetInnerHTML={{ __html: message.content }}
            className={cn(
              "rich-message-content",
              message.direction === 'outbound' ? "text-white" : "text-gray-900"
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
            message.direction === 'outbound' ? "text-blue-100" : "text-gray-600"
          )}>
            Attachments ({attachments.length})
          </div>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className={cn(
                "flex items-center justify-between p-2 rounded border border-opacity-20",
                message.direction === 'outbound' 
                  ? "bg-blue-500 bg-opacity-50" 
                  : "bg-white"
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
                    message.direction === 'outbound' ? "text-blue-100" : "text-gray-500"
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
                    ? "text-blue-100 hover:text-white hover:bg-blue-500" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .rich-message-content a {
          color: ${message.direction === 'outbound' ? '#bfdbfe' : '#3b82f6'};
          text-decoration: underline;
        }
        .rich-message-content strong {
          font-weight: bold;
        }
        .rich-message-content em {
          font-style: italic;
        }
        .rich-message-content u {
          text-decoration: underline;
        }
        .rich-message-content ul {
          list-style-type: disc;
          margin-left: 20px;
          margin-bottom: 10px;
        }
        .rich-message-content ol {
          list-style-type: decimal;
          margin-left: 20px;
          margin-bottom: 10px;
        }
        .rich-message-content blockquote {
          border-left: 4px solid ${message.direction === 'outbound' ? '#bfdbfe' : '#e5e7eb'};
          padding-left: 16px;
          margin: 10px 0;
          font-style: italic;
          opacity: 0.8;
        }
        .rich-message-content li {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};
