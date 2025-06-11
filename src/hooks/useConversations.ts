
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
  isGeneratingTitle?: boolean;
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
          // Determine title and loading state
          let title = 'New Conversation';
          let isGeneratingTitle = false;
          
          if (msg.title) {
            title = msg.title;
          } else {
            // No title yet - show loading state
            isGeneratingTitle = true;
          }
            
          conversationMap.set(msg.conversation_id, {
            id: msg.conversation_id,
            title,
            lastMessage: msg.message_content.substring(0, 100) + (msg.message_content.length > 100 ? '...' : ''),
            lastMessageAt: new Date(msg.created_at),
            messageCount: 1,
            isGeneratingTitle
          });
        } else {
          // Update existing conversation
          existing.messageCount += 1;
          if (new Date(msg.created_at) > existing.lastMessageAt) {
            existing.lastMessage = msg.message_content.substring(0, 100) + (msg.message_content.length > 100 ? '...' : '');
            existing.lastMessageAt = new Date(msg.created_at);
          }
          
          // Update title if we found one
          if (msg.title && (!existing.title || existing.title === 'New Conversation')) {
            existing.title = msg.title;
            existing.isGeneratingTitle = false;
          }
          
          // Show loading if we have 2+ messages but no title yet
          if (existing.messageCount >= 2 && (!msg.title || existing.title === 'New Conversation')) {
            existing.isGeneratingTitle = true;
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

  // Set up real-time updates for conversation titles
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversation-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scout_conversations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time conversation update:', payload);
          // Reload conversations when titles are updated
          if (payload.new.title && payload.new.title !== payload.old?.title) {
            console.log('Title updated, reloading conversations');
            loadConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
