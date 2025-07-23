
import { useMemo } from 'react';
import { useInboxData } from './useInboxData';
import type { EmailThread, EmailMessage } from '@/types/inbox';

export const useCandidateInboxData = (applicationId: string) => {
  const {
    threads: allThreads,
    messages: allMessages,
    isLoading,
    error,
    refetchThreads,
    markThreadAsRead,
    sendReply
  } = useInboxData();

  // Enhanced filtering for threads related to this specific candidate
  const candidateThreads = useMemo(() => {
    console.log('=== FILTERING CANDIDATE THREADS ===');
    console.log('Target application ID:', applicationId);
    console.log('All threads:', allThreads);
    
    // First, find threads directly linked by application_id (most reliable)
    const directThreads = allThreads.filter(thread => {
      const matches = thread.application_id === applicationId;
      console.log('Direct thread match:', {
        threadId: thread.id,
        threadApplicationId: thread.application_id,
        targetApplicationId: applicationId,
        matches
      });
      return matches;
    });
    
    if (directThreads.length > 0) {
      console.log('Found direct threads:', directThreads.map(t => t.id));
      return directThreads;
    }
    
    // If no direct threads, we still return empty array but log for debugging
    console.log('No direct threads found - candidate may not have any email communication yet');
    return [];
  }, [allThreads, applicationId]);

  // Filter messages for this candidate's threads
  const candidateMessages = useMemo(() => {
    const threadIds = candidateThreads.map(thread => thread.id);
    console.log('=== FILTERING CANDIDATE MESSAGES ===');
    console.log('Thread IDs to filter by:', threadIds);
    
    if (threadIds.length === 0) {
      console.log('No threads to filter messages by');
      return [];
    }
    
    const filtered = allMessages.filter(message => {
      const matches = threadIds.includes(message.thread_id);
      if (matches) {
        console.log('Message matches thread:', {
          messageId: message.id,
          threadId: message.thread_id,
          direction: message.direction,
          senderEmail: message.sender_email
        });
      }
      return matches;
    });
    
    console.log('Filtered messages count:', filtered.length);
    return filtered;
  }, [allMessages, candidateThreads]);

  // Calculate unread messages from candidate (inbound direction)
  const unreadInfo = useMemo(() => {
    const unreadCount = candidateThreads.reduce((sum, thread) => sum + thread.unread_count, 0);
    const hasUnreadMessages = unreadCount > 0;
    
    console.log('=== UNREAD MESSAGE CALCULATION ===');
    console.log('Candidate threads:', candidateThreads.map(t => ({ id: t.id, unread_count: t.unread_count })));
    console.log('Total unread count:', unreadCount);
    console.log('Has unread messages:', hasUnreadMessages);
    
    return {
      unreadCount,
      hasUnreadMessages
    };
  }, [candidateThreads]);

  // Get the primary thread for this candidate (most recent)
  const primaryThread = useMemo(() => {
    const sorted = candidateThreads.sort((a, b) => 
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );
    
    console.log('Primary thread:', sorted[0]?.id || 'none');
    return sorted[0] || null;
  }, [candidateThreads]);

  return {
    threads: candidateThreads,
    messages: candidateMessages,
    primaryThread,
    isLoading,
    error,
    refetchThreads,
    markThreadAsRead,
    sendReply,
    unreadCount: unreadInfo.unreadCount,
    hasUnreadMessages: unreadInfo.hasUnreadMessages
  };
};
