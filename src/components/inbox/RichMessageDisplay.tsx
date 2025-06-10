
import React from 'react';
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { EmailMessage } from "@/types/inbox";

interface RichMessageDisplayProps {
  message: EmailMessage;
}

export const RichMessageDisplay = ({ message }: RichMessageDisplayProps) => {
  const isRichContent = message.content.includes('<') || message.content.includes('&');

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
      <div className="text-sm">
        {isRichContent ? (
          <div 
            dangerouslySetInnerHTML={{ __html: message.content }}
            className={cn(
              message.direction === 'outbound' 
                ? "rich-message-content-outbound" 
                : "rich-message-content"
            )}
          />
        ) : (
          <div className="whitespace-pre-wrap">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
};
