import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/loggerService';

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageAt: Date;
  messageCount: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('scout_conversations')
        .select('conversation_id, message_content, created_at, is_ai_response, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation_id and create conversation summaries
      const conversationMap = new Map<string, Conversation>();
      
      data?.forEach(msg => {
        const existing = conversationMap.get(msg.conversation_id);
        
        if (!existing) {
          // Determine title: use AI-generated title if available, otherwise use first user message
          let title = 'New Conversation';
          if (msg.title) {
            title = msg.title;
          } else if (!msg.is_ai_response && msg.message_content) {
            title = msg.message_content.substring(0, 50) + (msg.message_content.length > 50 ? '...' : '');
          }
            
          conversationMap.set(msg.conversation_id, {
            id: msg.conversation_id,
            title,
            lastMessage: msg.message_content.substring(0, 100) + (msg.message_content.length > 100 ? '...' : ''),
            lastMessageAt: new Date(msg.created_at),
            messageCount: 1
          });
        } else {
          // Update existing conversation
          existing.messageCount += 1;
          if (new Date(msg.created_at) > existing.lastMessageAt) {
            existing.lastMessage = msg.message_content.substring(0, 100) + (msg.message_content.length > 100 ? '...' : '');
            existing.lastMessageAt = new Date(msg.created_at);
          }
          // Use AI-generated title if available, otherwise keep original title
          if (msg.title && !existing.title.includes('New Conversation')) {
            existing.title = msg.title;
          }
        }
      });

      const conversationList = Array.from(conversationMap.values())
        .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

      setConversations(conversationList);
    } catch (error) {
      logger.error('Failed to load conversations', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('scout_conversations')
        .delete()
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Clear from localStorage if it was the active conversation
      const activeConversationId = localStorage.getItem('scout-active-conversation');
      if (activeConversationId === conversationId) {
        localStorage.removeItem('scout-active-conversation');
      }
    } catch (error) {
      logger.error('Failed to delete conversation', { error });
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  return {
    conversations,
    isLoading,
    loadConversations,
    deleteConversation
  };
};
