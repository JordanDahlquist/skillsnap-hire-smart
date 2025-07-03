
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useActiveConversation = () => {
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const creatingRef = useRef(false);

  // Load active conversation from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('scout-active-conversation');
    if (stored) {
      setActiveConversationId(stored);
    }
  }, []);

  // Save to localStorage whenever activeConversationId changes
  const setActiveConversation = (conversationId: string | null) => {
    setActiveConversationId(conversationId);
    if (conversationId) {
      localStorage.setItem('scout-active-conversation', conversationId);
    } else {
      localStorage.removeItem('scout-active-conversation');
    }
  };

  const startNewConversation = async () => {
    if (!user || isCreating || creatingRef.current) return null;
    
    setIsCreating(true);
    creatingRef.current = true;
    
    const newId = crypto.randomUUID();
    
    try {
      // Create a minimal placeholder conversation in the database
      const { error } = await supabase
        .from('scout_conversations')
        .insert({
          user_id: user.id,
          conversation_id: newId,
          message_content: 'New conversation started',
          message_type: 'text',
          is_ai_response: false
        });

      if (error) {
        console.error('Error creating new conversation:', error);
        return null;
      }

      setActiveConversation(newId);
      return newId;
    } catch (error) {
      console.error('Failed to start new conversation:', error);
      return null;
    } finally {
      setIsCreating(false);
      creatingRef.current = false;
    }
  };

  return {
    activeConversationId,
    setActiveConversation,
    startNewConversation,
    isCreating
  };
};
