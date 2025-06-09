
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/loggerService';
import { toast } from 'sonner';

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
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);

  // Update conversation ID when prop changes
  useEffect(() => {
    setCurrentConversationId(conversationId);
  }, [conversationId]);

  // Load conversation history when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadConversationHistory(currentConversationId);
    } else {
      // No conversation selected, show welcome message
      setMessages([{
        id: 'welcome',
        content: "Hi! I'm Scout, your AI hiring assistant. I can help you analyze candidates, review job performance, make hiring decisions, and answer questions about your recruitment pipeline. What would you like to know?",
        isAi: true,
        timestamp: new Date(),
        jobCards: [],
        candidateCards: []
      }]);
    }
  }, [currentConversationId, user]);

  const loadConversationHistory = async (convId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scout_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = data?.map(msg => ({
        id: msg.id,
        content: msg.message_content,
        isAi: msg.is_ai_response,
        timestamp: new Date(msg.created_at),
        jobCards: [], // Cards will be loaded when needed
        candidateCards: []
      })) || [];

      if (loadedMessages.length === 0) {
        // New conversation, add welcome message
        setMessages([{
          id: 'welcome',
          content: "Hi! I'm Scout, your AI hiring assistant. I can help you analyze candidates, review job performance, make hiring decisions, and answer questions about your recruitment pipeline. What would you like to know?",
          isAi: true,
          timestamp: new Date(),
          jobCards: [],
          candidateCards: []
        }]);
      } else {
        setMessages(loadedMessages);
      }
    } catch (error) {
      logger.error('Failed to load conversation history', { error });
    }
  };

  const sendMessage = async (inputValue: string) => {
    if (!inputValue.trim() || isLoading || !user) return;

    // Create new conversation if none selected
    let activeConversationId = currentConversationId;
    if (!activeConversationId) {
      activeConversationId = crypto.randomUUID();
      setCurrentConversationId(activeConversationId);
      // Clear welcome message for new conversation
      setMessages([]);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputValue,
      isAi: false,
      timestamp: new Date(),
      jobCards: [],
      candidateCards: []
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      logger.info('Sending message to Scout AI', { message: inputValue });

      const { data, error } = await supabase.functions.invoke('scout-ai-chat', {
        body: {
          message: inputValue,
          conversation_id: activeConversationId
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.message,
        isAi: true,
        timestamp: new Date(),
        jobCards: data.jobCards || [],
        candidateCards: data.candidateCards || []
      };

      setMessages(prev => [...prev, aiMessage]);
      logger.info('Received Scout AI response', { 
        hasJobCards: data.jobCards?.length > 0,
        hasCandidateCards: data.candidateCards?.length > 0
      });

      // Update conversation list in sidebar
      if (onConversationUpdate) {
        onConversationUpdate();
      }

    } catch (error) {
      logger.error('Failed to send message to Scout AI', { error });
      toast.error('Failed to send message. Please try again.');
      
      // Remove the user message if AI response failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    currentConversationId
  };
};
