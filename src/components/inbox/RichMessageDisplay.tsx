
import React from 'react';
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { cleanEmailContent } from "@/utils/emailContentCleaner";
import { extractSenderName, getSenderInitials } from "@/utils/emailSenderUtils";
import type { EmailMessage } from "@/types/inbox";

interface RichMessageDisplayProps {
  message: EmailMessage;
}

export const RichMessageDisplay = ({ message }: RichMessageDisplayProps) => {
  const cleanedContent = cleanEmailContent(message.content);
  const isRichContent = cleanedContent.includes('<') || cleanedContent.includes('&');
  const senderName = extractSenderName(message.sender_email);
  const senderInitials = getSenderInitials(message.sender_email);

  return (
    <div
      className={cn(
        "p-4 rounded-lg max-w-[85%] shadow-sm",
        message.direction === 'outbound'
          ? "ml-auto bg-blue-600 text-white"
          : "mr-auto bg-white border border-gray-200 text-gray-900"
      )}
    >
      {/* Message Header */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
          message.direction === 'outbound'
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-600"
        )}>
          {message.direction === 'outbound' ? 'You' : senderInitials}
        </div>
        
        {/* Sender Info */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-sm font-medium truncate",
            message.direction === 'outbound' ? "text-blue-100" : "text-gray-900"
          )}>
            {message.direction === 'outbound' ? 'You' : senderName}
          </div>
          <div className={cn(
            "text-xs truncate",
            message.direction === 'outbound' ? "text-blue-200" : "text-gray-500"
          )}>
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </div>
        </div>
      </div>
      
      {/* Message Content */}
      <div className="text-sm leading-relaxed">
        {isRichContent ? (
          <div 
            dangerouslySetInnerHTML={{ __html: cleanedContent }}
            className={cn(
              "email-content",
              message.direction === 'outbound' 
                ? "email-content-outbound" 
                : "email-content-inbound"
            )}
          />
        ) : (
          <div className="whitespace-pre-wrap">
            {cleanedContent}
          </div>
        )}
      </div>
    </div>
  );
};
