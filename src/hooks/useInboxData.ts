import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useOptimizedAuth } from './useOptimizedAuth';
import { updateExistingEmailThreads } from '@/utils/updateEmailThreads';
import type { EmailThread, EmailMessage } from '@/types/inbox';

export const useInboxData = () => {
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
        .select(`
          *,
          jobs!left(title, company_name),
          applications!left(name)
        `)
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched threads:', data);
      
      // Transform the data to flatten job and application fields
      const transformedData = data?.map(thread => ({
        ...thread,
        job_title: thread.jobs?.title,
        company_name: thread.jobs?.company_name,
        applicant_name: thread.applications?.name,
        jobs: undefined, // Remove nested objects
        applications: undefined
      })) || [];
      
      return transformedData as EmailThread[];
    },
    enabled: !!user?.id,
  });

  // Fetch all messages - always fetch when we have a user
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
      
      // Fetch all messages for the user's threads
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

  // Enhanced send reply mutation with better error handling
  const sendReplyMutation = useMutation({
    mutationFn: async ({ 
      threadId, 
      content 
    }: { 
      threadId: string; 
      content: string; 
    }) => {
      const thread = threads.find(t => t.id === threadId);
      if (!thread || !user?.email || !profile?.unique_email) throw new Error('Thread, user, or unique email not found');

      // Get recipient email (first participant that's not the current user's unique email)
      const recipients = Array.isArray(thread.participants) 
        ? thread.participants.filter(p => 
            typeof p === 'string' && 
            p !== profile.unique_email
          )
        : [];
      
      const recipientEmail = recipients[0] || '';

      // Store the outbound message first
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

      // Convert rich text to plain text for email
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainTextContent = tempDiv.textContent || tempDiv.innerText || content;

      // Send actual email via edge function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-bulk-email', {
          body: {
            user_id: user.id,
            applications: [{
              email: recipientEmail,
              name: recipientEmail.split('@')[0]
            }],
            job: { 
              title: thread.job_title || 'Reply',
              company_name: thread.company_name || 'Your Company'
            },
            subject: thread.company_name 
              ? `Re: Regarding {position} Application at {company}`
              : `Re: ${thread.subject}`,
            content: plainTextContent,
            reply_to_email: profile.unique_email
          }
        });

        if (emailError) {
          console.error('Failed to send email via edge function:', emailError);
          // Don't throw here as we've already stored the message
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't throw here as we've already stored the message
      }
    },
    onSuccess: () => {
      console.log('Reply sent successfully, invalidating queries');
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

  // Improved real-time subscription
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
            console.log('Email threads change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['email-threads'] });
            queryClient.invalidateQueries({ queryKey: ['email-messages'] });
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
            console.log('Email messages change detected:', payload);
            
            // Always invalidate messages first
            queryClient.invalidateQueries({ queryKey: ['email-messages'] });
            
            // Check if this message belongs to one of our threads
            const messageThreadId = (payload.new as any)?.thread_id || (payload.old as any)?.thread_id;
            
            if (messageThreadId) {
              console.log('Message change for thread:', messageThreadId);
              // Also invalidate threads to update unread counts and last message time
              queryClient.invalidateQueries({ queryKey: ['email-threads'] });
              
              // Show notification for new inbound messages
              if (payload.eventType === 'INSERT' && (payload.new as any)?.direction === 'inbound') {
                toast({
                  title: "New message received",
                  description: `From: ${(payload.new as any)?.sender_email}`,
                });
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('Inbox subscription status:', status);
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
  }, [user?.id, queryClient, toast]);

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

  // Add debugging effect to track message loading
  useEffect(() => {
    console.log('Inbox data state:', {
      threadsCount: threads.length,
      messagesCount: messages.length,
      threadsLoading,
      messagesLoading,
      threadsError,
      messagesError
    });
  }, [threads.length, messages.length, threadsLoading, messagesLoading, threadsError, messagesError]);

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
