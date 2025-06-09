
import { useState, useEffect } from 'react';
import { processEmailSubject, hasTemplateVariables } from '@/utils/emailTemplateUtils';
import type { EmailThread } from '@/types/inbox';

export const useProcessedEmailSubjects = (threads: EmailThread[]) => {
  const [processedThreads, setProcessedThreads] = useState<EmailThread[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processSubjects = async () => {
      if (threads.length === 0) {
        setProcessedThreads([]);
        return;
      }

      setIsProcessing(true);
      
      const processed = await Promise.all(
        threads.map(async (thread) => {
          // Only process if the subject has template variables
          if (hasTemplateVariables(thread.subject)) {
            try {
              const processedSubject = await processEmailSubject(
                thread.subject,
                thread.application_id || undefined,
                thread.job_id || undefined
              );
              return { ...thread, subject: processedSubject };
            } catch (error) {
              console.error('Failed to process subject for thread:', thread.id, error);
              return thread;
            }
          }
          return thread;
        })
      );

      setProcessedThreads(processed);
      setIsProcessing(false);
    };

    processSubjects();
  }, [threads]);

  return { processedThreads, isProcessing };
};
