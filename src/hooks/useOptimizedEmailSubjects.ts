
import { useState, useEffect, useMemo } from 'react';
import { processEmailSubject, hasTemplateVariables } from '@/utils/emailTemplateUtils';
import type { EmailThread } from '@/types/inbox';

export const useOptimizedEmailSubjects = (threads: EmailThread[]) => {
  const [processedThreads, setProcessedThreads] = useState<EmailThread[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCache, setProcessedCache] = useState<Map<string, string>>(new Map());

  // Memoize threads that need processing
  const threadsToProcess = useMemo(() => {
    return threads.filter(thread => 
      hasTemplateVariables(thread.subject) && 
      !processedCache.has(thread.id + thread.subject)
    );
  }, [threads, processedCache]);

  useEffect(() => {
    const processSubjects = async () => {
      if (threads.length === 0) {
        setProcessedThreads([]);
        return;
      }

      // If no threads need processing, use cache
      if (threadsToProcess.length === 0) {
        const cached = threads.map(thread => {
          const cacheKey = thread.id + thread.subject;
          const cachedSubject = processedCache.get(cacheKey);
          
          if (cachedSubject) {
            return { ...thread, subject: cachedSubject };
          }
          return thread;
        });
        
        setProcessedThreads(cached);
        return;
      }

      setIsProcessing(true);
      
      try {
        // Process only new threads
        const newProcessedSubjects = await Promise.all(
          threadsToProcess.map(async (thread) => {
            try {
              const processedSubject = await processEmailSubject(
                thread.subject,
                thread.application_id || undefined,
                thread.job_id || undefined
              );
              return { threadId: thread.id, subject: thread.subject, processedSubject };
            } catch (error) {
              console.error('Failed to process subject for thread:', thread.id, error);
              return { threadId: thread.id, subject: thread.subject, processedSubject: thread.subject };
            }
          })
        );

        // Update cache with new processed subjects
        const newCache = new Map(processedCache);
        newProcessedSubjects.forEach(({ threadId, subject, processedSubject }) => {
          newCache.set(threadId + subject, processedSubject);
        });
        setProcessedCache(newCache);

        // Create final processed threads array
        const processed = threads.map(thread => {
          const cacheKey = thread.id + thread.subject;
          const cachedSubject = newCache.get(cacheKey);
          
          if (cachedSubject) {
            return { ...thread, subject: cachedSubject };
          }
          return thread;
        });

        setProcessedThreads(processed);
      } catch (error) {
        console.error('Failed to process email subjects:', error);
        setProcessedThreads(threads);
      } finally {
        setIsProcessing(false);
      }
    };

    processSubjects();
  }, [threads, threadsToProcess, processedCache]);

  return { processedThreads, isProcessing };
};
