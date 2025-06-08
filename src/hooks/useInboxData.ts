
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useOptimizedAuth } from './useOptimizedAuth';
import type { EmailThread, EmailMessage } from '@/types/inbox';

export const useInboxData = () => {
  const { user } = useOptimizedAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);

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
      console.log('Fetching messages for threads:', threadIds);
      const { data, error } = await supabase
        .from('email_messages')
        .select('*')
        .in('thread_id', threadIds)
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log('Fetched messages:', data);
      return data as EmailMessage[];
    },
    enabled: !!user?.id && threads.length > 0,
  });

  // Mark thread as read mutation
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

      // Store the outbound message first
      const { error: messageError } = await supabase
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

      if (messageError) throw messageError;

      // Send actual email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          applications: [{
            email: recipientEmail,
            name: recipientEmail.split('@')[0] // Simple fallback name
          }],
          job: { title: 'Reply' },
          subject: `Re: ${thread.subject} [Thread:${threadId}]`,
          content: content,
          reply_to_email: user.email
        }
      });

      if (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't throw here as we've already stored the message
      }
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

  // Enhanced refresh function
  const handleRefresh = async () => {
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
  };

  // Set up real-time subscription with proper cleanup
  useEffect(() => {
    if (!user?.id) return;

    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    console.log('Setting up inbox real-time subscription for user:', user.id);

    const channelName = `inbox-updates-${user.id}-${Date.now()}`;
    
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
            // Only invalidate if this message belongs to one of our threads
            const messageThreadId = payload.new?.thread_id || payload.old?.thread_id;
            const userThreadIds = threads.map(t => t.id);
            if (userThreadIds.includes(messageThreadId)) {
              queryClient.invalidateQueries({ queryKey: ['email-messages'] });
              queryClient.invalidateQueries({ queryKey: ['email-threads'] });
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      subscriptionRef.current = channel;

      return () => {
        console.log('Cleaning up inbox subscription');
        if (subscriptionRef.current) {
          supabase.removeChannel(subscriptionRef.current);
          subscriptionRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error setting up inbox subscription:', error);
    }
  }, [user?.id, queryClient, threads]);

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

  return {
    threads,
    messages,
    isLoading: threadsLoading || messagesLoading,
    error: threadsError || messagesError,
    refetchThreads: handleRefresh,
    markThreadAsRead: markAsReadMutation.mutate,
    sendReply: (threadId: string, content: string) => 
      sendReplyMutation.mutateAsync({ threadId, content })
  };
};
