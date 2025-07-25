import { useEffect, useState } from 'react';
import { useOptimizedAuth } from './useOptimizedAuth';
import { updateExistingEmailThreads } from '@/utils/updateEmailThreads';

export const useEmailThreadSync = () => {
  const { user } = useOptimizedAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const syncThreads = async () => {
      const lastSync = localStorage.getItem(`email_threads_sync_${user.id}`);
      const now = new Date().toISOString();
      
      // Only sync once per session or if it's been more than 24 hours
      if (lastSync) {
        const lastSyncDate = new Date(lastSync);
        const hoursSinceLastSync = (Date.now() - lastSyncDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastSync < 24) {
          setLastSyncTime(lastSync);
          return;
        }
      }

      setIsSyncing(true);
      try {
        await updateExistingEmailThreads(user.id);
        localStorage.setItem(`email_threads_sync_${user.id}`, now);
        setLastSyncTime(now);
      } catch (error) {
        console.error('Failed to sync email threads:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncThreads();
  }, [user?.id]);

  return {
    isSyncing,
    lastSyncTime
  };
};