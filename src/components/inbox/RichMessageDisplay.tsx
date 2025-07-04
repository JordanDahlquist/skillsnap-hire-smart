
import React from 'react';
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { cleanEmailContent, extractMessagePreview } from "@/utils/emailContentCleaner";
import { extractSenderName, getSenderInitials, formatSenderForDisplay } from "@/utils/emailSenderUtils";
import type { EmailMessage } from "@/types/inbox";

interface RichMessageDisplayProps {
  message: EmailMessage;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// Helper function to format message content with bullet points and line breaks
const formatMessageContent = (content: string): string => {
  if (!content) return '';
  
  // First clean the content
  let formatted = cleanEmailContent(content);
  
  // Convert line breaks to proper HTML breaks
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Convert dash bullets to proper bullet points
  formatted = formatted.replace(/^-\s*(.+)$/gm, '• $1');
  formatted = formatted.replace(/<br>-\s*(.+)/g, '<br>• $1');
  
  // Convert asterisk bullets to proper bullet points
  formatted = formatted.replace(/^\*\s*(.+)$/gm, '• $1');
  formatted = formatted.replace(/<br>\*\s*(.+)/g, '<br>• $1');
  
  return formatted;
};

export const RichMessageDisplay = ({ 
  message, 
  isExpanded = true, 
  onToggleExpand 
}: RichMessageDisplayProps) => {
  const cleanedContent = cleanEmailContent(message.content);
  const formattedContent = formatMessageContent(message.content);
  const isRichContent = formattedContent.includes('<') || formattedContent.includes('&');
  const senderName = extractSenderName(message.sender_email);
  const senderInitials = getSenderInitials(message.sender_email);
  const displayName = formatSenderForDisplay(message.sender_email);
  
  // For collapsed view, show preview
  const contentToShow = isExpanded ? formattedContent : extractMessagePreview(cleanedContent, 120);
  const isLongMessage = cleanedContent.length > 300;

  return (
    <div
      className={cn(
        "p-4 rounded-lg max-w-[85%] shadow-sm transition-all duration-200",
        message.direction === 'outbound'
          ? "ml-auto bg-blue-600 text-white"
          : "mr-auto bg-card border border-border text-foreground hover:shadow-md"
      )}
    >
      {/* Message Header */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
          message.direction === 'outbound'
            ? "bg-blue-500 text-white"
            : "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground"
        )}>
          {message.direction === 'outbound' ? 'You' : senderInitials}
        </div>
        
        {/* Sender Info */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-sm font-medium truncate",
            message.direction === 'outbound' ? "text-blue-100" : "text-foreground"
          )}>
            {message.direction === 'outbound' ? 'You' : displayName}
          </div>
          <div className={cn(
            "text-xs truncate flex items-center gap-1",
            message.direction === 'outbound' ? "text-blue-200" : "text-muted-foreground"
          )}>
            <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
            {!message.is_read && message.direction === 'inbound' && (
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Expand/Collapse button for long messages */}
        {isLongMessage && onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className={cn(
              "text-xs px-2 py-1 rounded transition-colors",
              message.direction === 'outbound'
                ? "text-blue-200 hover:text-white hover:bg-blue-500"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
        )}
      </div>
      
      {/* Message Content */}
      <div className="text-sm leading-relaxed">
        {isRichContent ? (
          <div 
            dangerouslySetInnerHTML={{ __html: contentToShow }}
            className={cn(
              "email-content",
              message.direction === 'outbound' 
                ? "email-content-outbound" 
                : "email-content-inbound"
            )}
          />
        ) : (
          <div 
            dangerouslySetInnerHTML={{ __html: contentToShow }}
            className="whitespace-pre-wrap break-words"
          />
        )}
        
        {/* Show "message truncated" indicator */}
        {!isExpanded && isLongMessage && (
          <div className={cn(
            "text-xs mt-2 italic",
            message.direction === 'outbound' ? "text-blue-200" : "text-muted-foreground"
          )}>
            Message truncated...
          </div>
        )}
      </div>
    </div>
  );
};
