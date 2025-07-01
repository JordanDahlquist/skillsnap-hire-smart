
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

  // Filter threads for this specific candidate
  const candidateThreads = useMemo(() => {
    return allThreads.filter(thread => thread.application_id === applicationId);
  }, [allThreads, applicationId]);

  // Filter messages for this candidate's threads
  const candidateMessages = useMemo(() => {
    const threadIds = candidateThreads.map(thread => thread.id);
    return allMessages.filter(message => threadIds.includes(message.thread_id));
  }, [allMessages, candidateThreads]);

  // Get the primary thread for this candidate (most recent)
  const primaryThread = useMemo(() => {
    return candidateThreads.sort((a, b) => 
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    )[0] || null;
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
