
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCandidateInboxData } from '@/hooks/useCandidateInboxData';
import { ConversationContainer } from '@/components/inbox/ConversationContainer';
import { EmailRichTextEditor } from '@/components/inbox/EmailRichTextEditor';
import { Button } from '@/components/ui/button';
import { Send, RefreshCw, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Application, Job } from '@/types';

interface CandidateInboxSectionProps {
  application: Application;
  job: Job;
}

export const CandidateInboxSection = ({ application, job }: CandidateInboxSectionProps) => {
  const { toast } = useToast();
  const {
    messages,
    threads,
    isLoading,
    sendReply,
    refetchThreads
  } = useCandidateInboxData(application.id);

  const [replyContent, setReplyContent] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  // Find the thread for this candidate
  const candidateThread = useMemo(() => {
    return threads.find(thread => thread.application_id === application.id);
  }, [threads, application.id]);

  // Filter messages for this candidate's thread
  const candidateMessages = useMemo(() => {
    if (!candidateThread) return [];
    return messages.filter(message => message.thread_id === candidateThread.id);
  }, [messages, candidateThread]);

  const handleSendReply = async () => {
    if (!replyContent.trim() || !candidateThread) {
      toast({
        title: "Error",
        description: "Please enter a message before sending",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      await sendReply(candidateThread.id, replyContent);
      setReplyContent('');
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Messages Container */}
      <Card>
        <CardContent className="p-0">
          <div className="h-96 border-b">
            {candidateMessages.length > 0 ? (
              <ConversationContainer 
                messages={candidateMessages}
                className="h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-foreground mb-1">
                    No messages yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation with {application.name}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Reply Section */}
          <div className="p-4 space-y-3">
            <EmailRichTextEditor
              value={replyContent}
              onChange={setReplyContent}
              placeholder={`Send a message to ${application.name}...`}
            />
            
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={refetchThreads}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <Button
                onClick={handleSendReply}
                disabled={isSending || !replyContent.trim()}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
