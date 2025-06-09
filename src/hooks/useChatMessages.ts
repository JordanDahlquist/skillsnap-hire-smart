
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/loggerService';

interface Message {
  id: string;
  content: string;
  isAi: boolean;
  timestamp: Date;
  jobCards?: any[];
  candidateCards?: any[];
}

interface UseChatMessagesProps {
  conversationId: string | null;
  onConversationUpdate?: () => void;
}

export const useChatMessages = ({ conversationId, onConversationUpdate }: UseChatMessagesProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMessages = async () => {
    if (!conversationId || !user) return;

    try {
      const { data, error } = await supabase
        .from('scout_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Filter out placeholder messages that were created when starting new conversations
      const filteredMessages = data?.filter(msg => 
        msg.message_content !== 'New conversation started'
      ) || [];

      const formattedMessages: Message[] = filteredMessages.map(msg => ({
        id: msg.id,
        content: msg.message_content,
        isAi: msg.is_ai_response,
        timestamp: new Date(msg.created_at),
        jobCards: msg.related_job_ids?.length > 0 ? [] : undefined,
        candidateCards: msg.related_application_ids?.length > 0 ? [] : undefined
      }));

      setMessages(formattedMessages);
    } catch (error) {
      logger.error('Failed to load messages', { error });
    }
  };

  const sendMessage = async (content: string) => {
    if (!conversationId || !user || !content.trim()) return;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('scout-ai-chat', {
        body: {
          message: content,
          conversation_id: conversationId
        }
      });

      if (response.error) throw response.error;

      // Reload messages to get the new conversation
      await loadMessages();
      
      // Trigger conversation list update
      onConversationUpdate?.();
    } catch (error) {
      logger.error('Failed to send message', { error });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversationId, user]);

  return {
    messages,
    isLoading,
    sendMessage
  };
};
