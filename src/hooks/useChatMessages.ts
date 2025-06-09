
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

const fetchCandidateData = async (applicationIds: string[]) => {
  if (!applicationIds.length) return [];
  
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs:job_id (
          title
        )
      `)
      .in('id', applicationIds);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Failed to fetch candidate data', { error });
    return [];
  }
};

const fetchJobData = async (jobIds: string[]) => {
  if (!jobIds.length) return [];
  
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .in('id', jobIds);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Failed to fetch job data', { error });
    return [];
  }
};

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

      // Process messages and fetch related data
      const formattedMessages: Message[] = await Promise.all(
        filteredMessages.map(async (msg) => {
          let candidateCards: any[] = [];
          let jobCards: any[] = [];

          // Fetch candidate data if application IDs exist
          if (msg.related_application_ids?.length > 0) {
            candidateCards = await fetchCandidateData(msg.related_application_ids);
          }

          // Fetch job data if job IDs exist
          if (msg.related_job_ids?.length > 0) {
            jobCards = await fetchJobData(msg.related_job_ids);
          }

          return {
            id: msg.id,
            content: msg.message_content,
            isAi: msg.is_ai_response,
            timestamp: new Date(msg.created_at),
            jobCards: jobCards.length > 0 ? jobCards : undefined,
            candidateCards: candidateCards.length > 0 ? candidateCards : undefined
          };
        })
      );

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
