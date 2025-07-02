
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCandidateInboxData } from '@/hooks/useCandidateInboxData';
import { ConversationContainer } from '@/components/inbox/ConversationContainer';
import { EmailRichTextEditor } from '@/components/inbox/EmailRichTextEditor';
import { Button } from '@/components/ui/button';
import { Send, Mail, User, Briefcase, AtSign, Building } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { emailService } from '@/services/emailService';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import type { Application, Job } from '@/types';

interface CandidateInboxSectionProps {
  application: Application;
  job: Job;
}

// Helper function to extract plain text from HTML content
const extractTextFromHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

export const CandidateInboxSection = ({ application, job }: CandidateInboxSectionProps) => {
  const { toast } = useToast();
  const { user, profile } = useOptimizedAuth();
  const {
    messages,
    threads,
    isLoading,
    sendReply,
    refetchThreads
  } = useCandidateInboxData(application.id);

  const [replyContent, setReplyContent] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  // Find the thread for this candidate - try by application_id first, then by participant email
  const candidateThread = useMemo(() => {
    // First try to find by application_id
    let thread = threads.find(thread => thread.application_id === application.id);
    
    // If no thread found by application_id, try to find by participant email
    if (!thread) {
      thread = threads.find(thread => {
        const participants = Array.isArray(thread.participants) ? thread.participants : [];
        return participants.some(participant => 
          typeof participant === 'string' && participant === application.email
        );
      });
    }
    
    return thread;
  }, [threads, application.id, application.email]);

  // Filter messages for this candidate's thread
  const candidateMessages = useMemo(() => {
    if (!candidateThread) return [];
    return messages.filter(message => message.thread_id === candidateThread.id);
  }, [messages, candidateThread]);

  // Create variables for the email editor
  const emailVariables = useMemo(() => [
    {
      name: '{candidateName}',
      icon: User,
      description: `Insert candidate name: ${application.name}`
    },
    {
      name: '{jobTitle}',
      icon: Briefcase,
      description: `Insert job title: ${job.title}`
    },
    {
      name: '{candidateEmail}',
      icon: AtSign,
      description: `Insert candidate email: ${application.email}`
    },
    {
      name: '{companyName}',
      icon: Building,
      description: `Insert company name: ${job.company_name || 'Company'}`
    }
  ], [application.name, application.email, job.title, job.company_name]);

  const handleSendReply = async () => {
    const textContent = extractTextFromHtml(replyContent);
    if (!textContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message before sending",
        variant: "destructive",
      });
      return;
    }

    if (!user || !profile?.unique_email) {
      toast({
        title: "Error",
        description: "User authentication required",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      let threadId = candidateThread?.id;
      
      // If no thread exists, create one
      if (!threadId) {
        console.log('No thread found, creating new thread for candidate:', application.email);
        threadId = await emailService.createEmailThread({
          userId: user.id,
          applicationId: application.id,
          jobId: job.id,
          subject: `Regarding ${job.title} Application`,
          participants: [profile.unique_email, application.email],
          userUniqueEmail: profile.unique_email
        });
        
        // Refresh threads to get the new thread
        await refetchThreads();
      }

      await sendReply(threadId, replyContent);
      setReplyContent('');
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Check if there's actual text content in the rich text editor
  const hasTextContent = extractTextFromHtml(replyContent).trim().length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
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
          <div className={`border-b ${candidateMessages.length > 0 ? 'h-96' : 'h-32'}`}>
            {candidateMessages.length > 0 ? (
              <ConversationContainer 
                messages={candidateMessages}
                className="h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-base font-medium text-foreground mb-1">
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
              variables={emailVariables}
            />
            
            <div className="flex justify-end">
              <Button
                onClick={handleSendReply}
                disabled={isSending || !hasTextContent}
                size="sm"
                variant="solid"
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
