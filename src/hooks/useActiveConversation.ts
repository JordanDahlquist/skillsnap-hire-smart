
import { useState, useEffect } from 'react';

export const useActiveConversation = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

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

  const startNewConversation = () => {
    const newId = crypto.randomUUID();
    setActiveConversation(newId);
    return newId;
  };

  return {
    activeConversationId,
    setActiveConversation,
    startNewConversation
  };
};
