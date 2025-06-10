
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useOptimizedAuth } from './useOptimizedAuth';
import { updateExistingEmailThreads } from '@/utils/updateEmailThreads';
import type { EmailThread, EmailMessage } from '@/types/inbox';

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

export const useOptimizedInboxData = () => {
  const { user, profile } = useOptimizedAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);
  const [threadsUpdated, setThreadsUpdated] = useState(false);

  // Auto-update existing threads on first load
  useEffect(() => {
    if (user?.id && !threadsUpdated) {
      updateExistingEmailThreads(user.id).then(() => {
        setThreadsUpdated(true);
      });
    }
  }, [user?.id, threadsUpdated]);

  // Fetch email threads with stable caching
  const { 
    data: threads = [], 
    isLoading: threadsLoading, 
    error: threadsError,
    refetch: refetchThreads 
  } = useQuery({
    queryKey: ['email-threads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching email threads for user:', user.id);
      const { data, error } = await supabase
        .from('email_threads')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched threads:', data);
      return data as EmailThread[];
    },
    enabled: !!user?.id,
    staleTime: 30000, // Keep data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Fetch all messages with optimized caching
  const { 
    data: messages = [], 
    isLoading: messagesLoading,
    error: messagesError 
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
    staleTime: 15000, // Keep data fresh for 15 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
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
      // Use targeted updates instead of full invalidation
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
      content, 
      attachments = [] 
    }: { 
      threadId: string; 
      content: string; 
      attachments?: AttachmentFile[] 
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

      const attachmentsData = attachments.map(att => ({
        id: att.id,
        name: att.name,
        size: att.size,
        type: att.type,
        url: att.url
      }));

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
        attachments: attachmentsData,
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
          is_read: true,
          attachments: attachmentsData
        });

      if (messageError) {
        console.error('Failed to store message:', messageError);
        throw messageError;
      }

      // Send actual email via edge function with attachments
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
            reply_to_email: profile.unique_email,
            attachments: attachmentsData
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
      
      // Optimistically update messages cache
      queryClient.setQueryData(['email-messages', user?.id], (oldMessages: EmailMessage[] | undefined) => {
        if (!oldMessages) return [newMessage];
        return [...oldMessages, newMessage];
      });

      // Update thread's last_message_at
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

  // Debounced refresh function
  const handleRefresh = useCallback(async () => {
    console.log('Refreshing inbox data...');
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['email-threads'] }),
        queryClient.invalidateQueries({ queryKey: ['email-messages'] })
      ]);
      await refetchThreads();
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
            
            // Only update specific thread data without affecting list visibility
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
            
            // Check if this message belongs to one of our threads
            const belongsToUser = stableThreads.some(thread => thread.id === newMessage.thread_id);
            
            if (belongsToUser) {
              // Add new message to cache without affecting list visibility
              queryClient.setQueryData(['email-messages', user?.id], (oldMessages: EmailMessage[] | undefined) => {
                if (!oldMessages) return [newMessage];
                return [...oldMessages, newMessage];
              });

              // Show notification for new inbound messages
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
  const sendReply = async (threadId: string, content: string, attachments?: AttachmentFile[]): Promise<void> => {
    await sendReplyMutation.mutateAsync({ threadId, content, attachments });
  };

  return {
    threads: stableThreads,
    messages: stableMessages,
    isLoading: threadsLoading || messagesLoading,
    error: threadsError || messagesError,
    refetchThreads: handleRefresh,
    markThreadAsRead: markAsReadMutation.mutate,
    sendReply
  };
};
