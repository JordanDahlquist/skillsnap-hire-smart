
import { useOptimizedAuth } from './useOptimizedAuth';
import { useOptimizedInboxData } from './useOptimizedInboxData';

export const useInboxUnreadCount = () => {
  const { user } = useOptimizedAuth();
  const { threadCounts, isLoading, error } = useOptimizedInboxData('active');

  // Only return unread count for authenticated users
  if (!user) {
    return {
      unreadCount: 0,
      isLoading: false,
      error: null
    };
  }

  return {
    unreadCount: threadCounts?.activeUnread || 0,
    isLoading,
    error
  };
};
