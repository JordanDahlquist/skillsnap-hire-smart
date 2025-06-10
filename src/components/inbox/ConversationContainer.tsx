
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageList } from './MessageList';
import type { EmailMessage } from '@/types/inbox';

interface ConversationContainerProps {
  messages: EmailMessage[];
  className?: string;
}

export const ConversationContainer = ({ messages, className }: ConversationContainerProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  return (
    <div className={className}>
      <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
        <div className="p-4 pb-2">
          <MessageList messages={messages} />
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
