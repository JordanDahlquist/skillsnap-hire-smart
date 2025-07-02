
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
    
    // First, find threads directly linked by application_id
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
    
    // If no direct threads, we might need to look up candidate email and match by participants
    // This is a fallback for older threads that might not have application_id set
    console.log('No direct threads found, checking for participant-based matches');
    return [];
  }, [allThreads, applicationId]);

  // Filter messages for this candidate's threads
  const candidateMessages = useMemo(() => {
    const threadIds = candidateThreads.map(thread => thread.id);
    console.log('=== FILTERING CANDIDATE MESSAGES ===');
    console.log('Thread IDs to filter by:', threadIds);
    
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
    sendReply
  };
};
