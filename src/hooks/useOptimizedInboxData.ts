import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useOptimizedAuth } from './useOptimizedAuth';
import { updateExistingEmailThreads } from '@/utils/updateEmailThreads';
import { useTabVisibility } from './useTabVisibility';
import { useUserActivity } from './useUserActivity';
import type { EmailThread, EmailMessage } from '@/types/inbox';
import { emailService } from '@/services/emailService';
import type { InboxFilter } from './useInboxFilters';

export const useOptimizedInboxData = (currentFilter: InboxFilter = 'active') => {
  const { user, profile } = useOptimizedAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);
  const [threadsUpdated, setThreadsUpdated] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);

  // Tab visibility and user activity detection
  const isTabVisible = useTabVisibility();
  const isUserActive = useUserActivity(30000); // 30 seconds of inactivity

  // Calculate refresh interval based on tab visibility and user activity
  const refreshInterval = useMemo(() => {
    if (!isAutoRefreshEnabled) return false;
    
    // Don't auto-refresh if user is actively typing or interacting
    if (isUserActive && isTabVisible) {
      return false; // Pause during active interaction
    }
    
    // Active tab: 2 minutes, Background tab: 10 minutes
    return isTabVisible ? 2 * 60 * 1000 : 10 * 60 * 1000;
  }, [isTabVisible, isUserActive, isAutoRefreshEnabled]);

  // Auto-update existing threads on first load
  useEffect(() => {
    if (user?.id && !threadsUpdated) {
      updateExistingEmailThreads(user.id).then(() => {
        setThreadsUpdated(true);
      });
    }
  }, [user?.id, threadsUpdated]);

  // Fetch email threads with auto-refresh and filtering
  const { 
    data: allThreads = [], 
    isLoading: threadsLoading, 
    error: threadsError,
    refetch: refetchThreads,
    isFetching: isThreadsFetching
  } = useQuery({
    queryKey: ['email-threads', user?.id, currentFilter],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching email threads for user:', user.id, 'filter:', currentFilter);
      
      let query = supabase
        .from('email_threads')
        .select('*')
        .eq('user_id', user.id);

      // Apply filter
      if (currentFilter === 'active') {
        query = query.eq('status', 'active');
      } else if (currentFilter === 'archived') {
        query = query.eq('status', 'archived');
      }
      // 'all' filter doesn't add any status condition

      const { data, error } = await query.order('last_message_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched threads:', data);
      setLastRefreshTime(new Date());
      return data as EmailThread[];
    },
    enabled: !!user?.id,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });

  // Filter threads based on current filter for local state
  const threads = useMemo(() => allThreads, [allThreads]);

  // Fetch all messages with auto-refresh
  const { 
    data: messages = [], 
    isLoading: messagesLoading,
    error: messagesError,
    isFetching: isMessagesFetching
  } = useQuery({
    queryKey: ['email-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID, skipping message fetch');
        return [];
      }
      
      console.log('Fetching messages for user:', user.id);
      
      const { data, error } = await supabase
        .from('email_messages')
        .select(`
          *,
          email_threads!inner(user_id)
        `)
        .eq('email_threads.user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log('Fetched messages:', data?.length || 0, 'messages');
      return data as EmailMessage[];
    },
    enabled: !!user?.id,
    staleTime: 15000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });

  // Memoize stable threads to prevent unnecessary re-renders
  const stableThreads = useMemo(() => threads, [threads]);
  const stableMessages = useMemo(() => messages, [messages]);

  // Optimized mark as read with targeted updates
  const markAsReadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      console.log('Marking thread as read:', threadId);
      const { error: messagesError } = await supabase
        .from('email_messages')
        .update({ is_read: true })
        .eq('thread_id', threadId)
        .eq('direction', 'inbound')
        .eq('is_read', false);

      if (messagesError) throw messagesError;

      const { error: threadError } = await supabase
        .from('email_threads')
        .update({ unread_count: 0 })
        .eq('id', threadId);

      if (threadError) throw threadError;

      return threadId;
    },
    onSuccess: (threadId) => {
      queryClient.setQueryData(['email-threads', user?.id], (oldThreads: EmailThread[] | undefined) => {
        if (!oldThreads) return oldThreads;
        
        return oldThreads.map(thread => 
          thread.id === threadId 
            ? { ...thread, unread_count: 0 }
            : thread
        );
      });

      queryClient.setQueryData(['email-messages', user?.id], (oldMessages: EmailMessage[] | undefined) => {
        if (!oldMessages) return oldMessages;
        
        return oldMessages.map(message => 
          message.thread_id === threadId && message.direction === 'inbound'
            ? { ...message, is_read: true }
            : message
        );
      });
    },
    onError: (error) => {
      console.error('Failed to mark as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark messages as read",
        variant: "destructive",
      });
    }
  });

  // Optimized send reply with targeted updates - returns Promise<void>
  const sendReplyMutation = useMutation({
    mutationFn: async ({ 
      threadId, 
      content 
    }: { 
      threadId: string; 
      content: string; 
    }) => {
      const thread = stableThreads.find(t => t.id === threadId);
      if (!thread || !user?.email || !profile?.unique_email) throw new Error('Thread, user, or unique email not found');

      const recipients = Array.isArray(thread.participants) 
        ? thread.participants.filter(p => 
            typeof p === 'string' && 
            p !== profile.unique_email
          )
        : [];
      
      const recipientEmail = recipients[0] || '';

      const newMessage = {
        id: crypto.randomUUID(),
        thread_id: threadId,
        sender_email: profile.unique_email,
        recipient_email: recipientEmail,
        subject: `Re: ${thread.subject}`,
        content,
        direction: 'outbound' as const,
        message_type: 'reply' as const,
        is_read: true,
        created_at: new Date().toISOString()
      };

      // Store the outbound message
      console.log('Storing outbound message for thread:', threadId);
      const { error: messageError } = await supabase
        .from('email_messages')
        .insert({
          thread_id: threadId,
          sender_email: profile.unique_email,
          recipient_email: recipientEmail,
          subject: `Re: ${thread.subject}`,
          content,
          direction: 'outbound',
          message_type: 'reply',
          is_read: true
        });

      if (messageError) {
        console.error('Failed to store message:', messageError);
        throw messageError;
      }

      // Send actual email via edge function
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainTextContent = tempDiv.textContent || tempDiv.innerText || content;

        const { error: emailError } = await supabase.functions.invoke('send-bulk-email', {
          body: {
            user_id: user.id,
            applications: [{
              email: recipientEmail,
              name: recipientEmail.split('@')[0]
            }],
            job: { title: 'Reply' },
            subject: `Re: ${thread.subject} [Thread:${threadId}]`,
            content: plainTextContent,
            reply_to_email: profile.unique_email
          }
        });

        if (emailError) {
          console.error('Failed to send email via edge function:', emailError);
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }

      return { threadId, newMessage };
    },
    onSuccess: ({ threadId, newMessage }) => {
      console.log('Reply sent successfully, updating cache');
      
      queryClient.setQueryData(['email-messages', user?.id], (oldMessages: EmailMessage[] | undefined) => {
        if (!oldMessages) return [newMessage];
        return [...oldMessages, newMessage];
      });

      queryClient.setQueryData(['email-threads', user?.id], (oldThreads: EmailThread[] | undefined) => {
        if (!oldThreads) return oldThreads;
        
        return oldThreads.map(thread => 
          thread.id === threadId 
            ? { ...thread, last_message_at: newMessage.created_at }
            : thread
        );
      });

      toast({
        title: "Reply sent",
        description: "Your message has been sent successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to send reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    }
  });

  // Archive thread mutation
  const archiveThreadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      await emailService.archiveThread(threadId);
      return threadId;
    },
    onSuccess: (threadId) => {
      queryClient.setQueryData(['email-threads', user?.id, 'active'], (oldThreads: EmailThread[] | undefined) => {
        if (!oldThreads) return oldThreads;
        return oldThreads.filter(thread => thread.id !== threadId);
      });

      queryClient.setQueryData(['email-threads', user?.id, 'archived'], (oldThreads: EmailThread[] | undefined) => {
        const archivedThread = allThreads.find(t => t.id === threadId);
        if (!archivedThread || !oldThreads) return oldThreads || [];
        return [...oldThreads, { ...archivedThread, status: 'archived' as const }];
      });

      toast({
        title: "Thread archived",
        description: "The conversation has been archived successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to archive thread:', error);
      toast({
        title: "Error",
        description: "Failed to archive thread",
        variant: "destructive",
      });
    }
  });

  // Unarchive thread mutation
  const unarchiveThreadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      await emailService.unarchiveThread(threadId);
      return threadId;
    },
    onSuccess: (threadId) => {
      queryClient.setQueryData(['email-threads', user?.id, 'archived'], (oldThreads: EmailThread[] | undefined) => {
        if (!oldThreads) return oldThreads;
        return oldThreads.filter(thread => thread.id !== threadId);
      });

      queryClient.setQueryData(['email-threads', user?.id, 'active'], (oldThreads: EmailThread[] | undefined) => {
        const unarchivedThread = allThreads.find(t => t.id === threadId);
        if (!unarchivedThread || !oldThreads) return oldThreads || [];
        return [...oldThreads, { ...unarchivedThread, status: 'active' as const }];
      });

      toast({
        title: "Thread unarchived",
        description: "The conversation has been moved back to active",
      });
    },
    onError: (error) => {
      console.error('Failed to unarchive thread:', error);
      toast({
        title: "Error",
        description: "Failed to unarchive thread",
        variant: "destructive",
      });
    }
  });

  // Delete thread mutation
  const deleteThreadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      await emailService.deleteThreadPermanently(threadId);
      return threadId;
    },
    onSuccess: (threadId) => {
      // Remove from all cached queries
      ['active', 'archived', 'all'].forEach(filter => {
        queryClient.setQueryData(['email-threads', user?.id, filter], (oldThreads: EmailThread[] | undefined) => {
          if (!oldThreads) return oldThreads;
          return oldThreads.filter(thread => thread.id !== threadId);
        });
      });

      // Remove associated messages
      queryClient.setQueryData(['email-messages', user?.id], (oldMessages: EmailMessage[] | undefined) => {
        if (!oldMessages) return oldMessages;
        return oldMessages.filter(message => message.thread_id !== threadId);
      });

      toast({
        title: "Thread deleted",
        description: "The conversation has been permanently deleted",
      });
    },
    onError: (error) => {
      console.error('Failed to delete thread:', error);
      toast({
        title: "Error",
        description: "Failed to delete thread",
        variant: "destructive",
      });
    }
  });

  // Bulk operations mutations
  const bulkArchiveMutation = useMutation({
    mutationFn: async (threadIds: string[]) => {
      await emailService.bulkArchiveThreads(threadIds);
      return threadIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-threads'] });
      toast({
        title: "Threads archived",
        description: "Selected conversations have been archived",
      });
    },
    onError: (error) => {
      console.error('Failed to bulk archive threads:', error);
      toast({
        title: "Error",
        description: "Failed to archive selected threads",
        variant: "destructive",
      });
    }
  });

  const bulkUnarchiveMutation = useMutation({
    mutationFn: async (threadIds: string[]) => {
      await emailService.bulkUnarchiveThreads(threadIds);
      return threadIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-threads'] });
      toast({
        title: "Threads unarchived",
        description: "Selected conversations have been moved to active",
      });
    },
    onError: (error) => {
      console.error('Failed to bulk unarchive threads:', error);
      toast({
        title: "Error",
        description: "Failed to unarchive selected threads",
        variant: "destructive",
      });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (threadIds: string[]) => {
      await emailService.bulkDeleteThreadsPermanently(threadIds);
      return threadIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-threads'] });
      queryClient.invalidateQueries({ queryKey: ['email-messages'] });
      toast({
        title: "Threads deleted",
        description: "Selected conversations have been permanently deleted",
      });
    },
    onError: (error) => {
      console.error('Failed to bulk delete threads:', error);
      toast({
        title: "Error",
        description: "Failed to delete selected threads",
        variant: "destructive",
      });
    }
  });

  // Enhanced refresh function
  const handleRefresh = useCallback(async () => {
    console.log('Manually refreshing inbox data...');
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['email-threads'] }),
        queryClient.invalidateQueries({ queryKey: ['email-messages'] })
      ]);
      await refetchThreads();
      setLastRefreshTime(new Date());
      toast({
        title: "Inbox refreshed",
        description: "Your messages have been updated",
      });
    } catch (error) {
      console.error('Failed to refresh inbox:', error);
      toast({
        title: "Error",
        description: "Failed to refresh inbox",
        variant: "destructive",
      });
    }
  }, [queryClient, refetchThreads, toast]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshEnabled(prev => !prev);
    toast({
      title: isAutoRefreshEnabled ? "Auto-refresh disabled" : "Auto-refresh enabled",
      description: isAutoRefreshEnabled 
        ? "Inbox will no longer refresh automatically" 
        : "Inbox will refresh automatically every few minutes",
    });
  }, [isAutoRefreshEnabled, toast]);

  // Optimized real-time subscription with targeted updates
  useEffect(() => {
    if (!user?.id) return;

    if (subscriptionRef.current) {
      console.log('Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    console.log('Setting up optimized inbox real-time subscription for user:', user.id);

    const channelName = `inbox-updates-${user.id}-${Date.now()}`;
    
    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'email_threads',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Email thread update detected:', payload);
            const updatedThread = payload.new as EmailThread;
            
            queryClient.setQueryData(['email-threads', user?.id], (oldThreads: EmailThread[] | undefined) => {
              if (!oldThreads) return oldThreads;
              
              return oldThreads.map(thread => 
                thread.id === updatedThread.id 
                  ? { ...thread, ...updatedThread }
                  : thread
              );
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'email_messages'
          },
          (payload) => {
            console.log('New email message detected:', payload);
            const newMessage = payload.new as EmailMessage;
            
            const belongsToUser = stableThreads.some(thread => thread.id === newMessage.thread_id);
            
            if (belongsToUser) {
              queryClient.setQueryData(['email-messages', user?.id], (oldMessages: EmailMessage[] | undefined) => {
                if (!oldMessages) return [newMessage];
                return [...oldMessages, newMessage];
              });

              if (newMessage.direction === 'inbound') {
                toast({
                  title: "New message received",
                  description: `From: ${newMessage.sender_email}`,
                });
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('Optimized inbox subscription status:', status);
        });

      subscriptionRef.current = channel;

      return () => {
        console.log('Cleaning up optimized inbox subscription');
        if (subscriptionRef.current) {
          supabase.removeChannel(subscriptionRef.current);
          subscriptionRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error setting up optimized inbox subscription:', error);
    }
  }, [user?.id, queryClient, toast, stableThreads]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        console.log('Component unmounting, cleaning up subscription');
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  // Wrapper function that returns Promise<void>
  const sendReply = async (threadId: string, content: string): Promise<void> => {
    await sendReplyMutation.mutateAsync({ threadId, content });
  };

  const isAutoRefreshing = (isThreadsFetching || isMessagesFetching) && isAutoRefreshEnabled;

  return {
    threads,
    messages: stableMessages,
    isLoading: threadsLoading || messagesLoading,
    error: threadsError || messagesError,
    refetchThreads: handleRefresh,
    markThreadAsRead: markAsReadMutation.mutate,
    sendReply,
    // Archive operations
    archiveThread: archiveThreadMutation.mutate,
    unarchiveThread: unarchiveThreadMutation.mutate,
    deleteThread: deleteThreadMutation.mutate,
    // Bulk operations
    bulkArchiveThreads: bulkArchiveMutation.mutate,
    bulkUnarchiveThreads: bulkUnarchiveMutation.mutate,
    bulkDeleteThreads: bulkDeleteMutation.mutate,
    // Auto-refresh related returns
    isAutoRefreshEnabled,
    toggleAutoRefresh,
    lastRefreshTime,
    isAutoRefreshing,
    isTabVisible,
  };
};
