
import { useMemo } from 'react';
import { processTemplateVariables } from '@/utils/templateProcessor';
import type { EmailThread } from '@/types/inbox';

interface ProcessedThread extends EmailThread {
  processedSubject: string;
}

export const useOptimizedEmailSubjects = (threads: EmailThread[]) => {
  const processedThreads = useMemo(() => {
    return threads.map(thread => ({
      ...thread,
      processedSubject: processTemplateVariables(thread.subject)
    }));
  }, [threads]);

  const isProcessing = false; // Since processing is synchronous

  return {
    processedThreads,
    isProcessing
  };
};
