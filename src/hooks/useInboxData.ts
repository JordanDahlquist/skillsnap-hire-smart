
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useOptimizedAuth } from './useOptimizedAuth';
import type { EmailThread, EmailMessage } from '@/types/inbox';

export const useInboxData = () => {
  const { user } = useOptimizedAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email threads
  const { 
    data: threads = [], 
    isLoading: threadsLoading, 
    error: threadsError,
    refetch: refetchThreads 
  } = useQuery({
    queryKey: ['email-threads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('email_threads')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data as EmailThread[];
    },
    enabled: !!user?.id,
  });

  // Fetch all messages for threads
  const { 
    data: messages = [], 
    isLoading: messagesLoading,
    error: messagesError 
  } = useQuery({
    queryKey: ['email-messages', user?.id],
    queryFn: async () => {
      if (!user?.id || threads.length === 0) return [];
      
      const threadIds = threads.map(t => t.id);
      const { data, error } = await supabase
        .from('email_messages')
        .select('*')
        .in('thread_id', threadIds)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as EmailMessage[];
    },
    enabled: !!user?.id && threads.length > 0,
  });

  // Mark thread as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (threadId: string) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-threads'] });
      queryClient.invalidateQueries({ queryKey: ['email-messages'] });
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

  // Send reply mutation
  const sendReplyMutation = useMutation({
    mutationFn: async ({ threadId, content }: { threadId: string; content: string }) => {
      const thread = threads.find(t => t.id === threadId);
      if (!thread || !user?.email) throw new Error('Thread or user not found');

      // Get recipient email (first participant that's not the current user)
      const recipients = Array.isArray(thread.participants) 
        ? thread.participants.filter(p => typeof p === 'string' && p !== user.email)
        : [];
      
      const recipientEmail = recipients[0] || '';

      const { error } = await supabase
        .from('email_messages')
        .insert({
          thread_id: threadId,
          sender_email: user.email,
          recipient_email: recipientEmail,
          subject: `Re: ${thread.subject}`,
          content,
          direction: 'outbound',
          message_type: 'reply',
          is_read: true
        });

      if (error) throw error;

      // TODO: Send actual email via edge function
      // For now, we just store the message in the database
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-threads'] });
      queryClient.invalidateQueries({ queryKey: ['email-messages'] });
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

  // Set up real-time subscription with proper cleanup
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up inbox real-time subscription for user:', user.id);

    const channelName = `inbox-updates-${user.id}`;
    
    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'email_threads',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Email threads change:', payload);
            queryClient.invalidateQueries({ queryKey: ['email-threads'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'email_messages'
          },
          (payload) => {
            console.log('Email messages change:', payload);
            queryClient.invalidateQueries({ queryKey: ['email-messages'] });
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        console.log('Cleaning up inbox subscription');
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up inbox subscription:', error);
    }
  }, [user?.id, queryClient]);

  return {
    threads,
    messages,
    isLoading: threadsLoading || messagesLoading,
    error: threadsError || messagesError,
    refetchThreads,
    markThreadAsRead: markAsReadMutation.mutate,
    sendReply: (threadId: string, content: string) => 
      sendReplyMutation.mutateAsync({ threadId, content })
  };
};
