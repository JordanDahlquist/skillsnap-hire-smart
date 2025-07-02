
import { supabase } from "@/integrations/supabase/client";
import { processEmailSubject } from "@/utils/emailTemplateUtils";

export interface EmailThreadData {
  userId: string;
  applicationId?: string;
  jobId?: string;
  subject: string;
  participants: string[];
  userUniqueEmail: string;
}

export interface SendEmailData {
  threadId?: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  content: string;
  applicationId?: string;
  jobId?: string;
  userUniqueEmail: string;
}

export const emailService = {
  async createEmailThread(data: EmailThreadData): Promise<string> {
    const startTime = Date.now();
    console.log('=== EMAIL SERVICE: Creating email thread ===');
    console.log('Thread creation started at:', new Date().toISOString());
    console.log('Thread data:', {
      userId: data.userId,
      applicationId: data.applicationId,
      jobId: data.jobId,
      subject: data.subject,
      participants: data.participants,
      userUniqueEmail: data.userUniqueEmail
    });
    
    try {
      const processedSubject = await processEmailSubject(
        data.subject,
        data.applicationId,
        data.jobId
      );
      
      console.log('Subject processed:', {
        original: data.subject,
        processed: processedSubject
      });
      
      const threadData = {
        user_id: data.userId,
        application_id: data.applicationId || null,
        job_id: data.jobId || null,
        subject: processedSubject,
        participants: data.participants,
        reply_to_email: data.userUniqueEmail,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        status: 'active'
      };
      
      console.log('Thread data prepared for insertion:', threadData);
      
      const { data: thread, error } = await supabase
        .from('email_threads')
        .insert(threadData)
        .select('id')
        .single();

      if (error) {
        console.error('THREAD CREATION FAILED:', {
          error,
          errorMessage: error.message,
          threadData,
          duration: Date.now() - startTime
        });
        throw error;
      }
      
      console.log('Thread created successfully:', {
        threadId: thread.id,
        duration: Date.now() - startTime
      });
      
      return thread.id;
    } catch (error: any) {
      console.error('FATAL: Thread creation failed:', {
        error,
        errorMessage: error?.message,
        data,
        duration: Date.now() - startTime
      });
      throw error;
    }
  },

  async sendEmail(data: SendEmailData): Promise<void> {
    const startTime = Date.now();
    console.log('=== EMAIL SERVICE: Enhanced email sending started ===');
    console.log('Email send initiated at:', new Date().toISOString());
    console.log('Send email data:', {
      threadId: data.threadId,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      subject: data.subject,
      contentLength: data.content?.length || 0,
      applicationId: data.applicationId,
      jobId: data.jobId,
      userUniqueEmail: data.userUniqueEmail
    });
    
    try {
      let threadId = data.threadId;
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        console.error('SEND EMAIL FAILED: User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('User authentication verified:', {
        userId: user.data.user.id,
        userEmail: user.data.user.email
      });

      // Get user profile for company branding
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_name')
        .eq('id', user.data.user.id)
        .single();

      // Get job data for company name
      let jobCompanyName = '';
      if (data.jobId) {
        const { data: job } = await supabase
          .from('jobs')
          .select('company_name')
          .eq('id', data.jobId)
          .single();
        jobCompanyName = job?.company_name || '';
      }

      // Use proper company name hierarchy
      const companyName = jobCompanyName || profile?.company_name || 'Your Company';
      
      const processedSubject = await processEmailSubject(
        data.subject,
        data.applicationId,
        data.jobId,
        { candidateName: data.recipientName }
      );

      console.log('Email subject processed:', {
        original: data.subject,
        processed: processedSubject,
        companyName
      });

      // Create thread if it doesn't exist - CRITICAL: Link to application_id
      if (!threadId) {
        console.log('No thread ID provided, creating new thread with application link');
        const threadCreationStart = Date.now();
        
        threadId = await this.createEmailThread({
          userId: user.data.user.id,
          applicationId: data.applicationId,
          jobId: data.jobId,
          subject: processedSubject,
          participants: [data.userUniqueEmail, data.recipientEmail],
          userUniqueEmail: data.userUniqueEmail
        });
        
        console.log('Thread created for email:', {
          threadId,
          duration: Date.now() - threadCreationStart
        });
      }

      console.log('Using thread ID for email:', threadId);

      // Store the outbound message with HTML formatting preserved
      const messageData = {
        thread_id: threadId,
        sender_email: data.userUniqueEmail,
        recipient_email: data.recipientEmail,
        subject: processedSubject,
        content: data.content,
        direction: 'outbound',
        message_type: 'original',
        is_read: true
      };
      
      console.log('Storing outbound message in database:', {
        threadId: messageData.thread_id,
        senderEmail: messageData.sender_email,
        recipientEmail: messageData.recipient_email,
        subject: messageData.subject,
        contentLength: messageData.content?.length || 0,
        direction: messageData.direction
      });
      
      const messageStoreStart = Date.now();
      const { error: messageError } = await supabase
        .from('email_messages')
        .insert(messageData);

      if (messageError) {
        console.error('MESSAGE STORAGE FAILED:', {
          error: messageError,
          messageData,
          duration: Date.now() - messageStoreStart
        });
        throw messageError;
      }

      console.log('Message stored successfully in database:', {
        duration: Date.now() - messageStoreStart
      });

      // Send the actual email via existing edge function with clean subject (no thread ID)
      const emailPayload = {
        user_id: user.data.user.id,
        applications: [{
          email: data.recipientEmail,
          name: data.recipientName
        }],
        job: { title: 'Email' },
        subject: processedSubject, // Clean subject line for recipient
        content: data.content,
        reply_to_email: data.userUniqueEmail,
        thread_id: threadId,
        application_id: data.applicationId,
        job_id: data.jobId,
        company_name: companyName, // Pass company name for proper branding
        create_threads: false
      };
      
      console.log('Prepared email payload for edge function:', {
        userId: emailPayload.user_id,
        recipientCount: emailPayload.applications.length,
        subject: emailPayload.subject,
        contentLength: emailPayload.content?.length || 0,
        replyToEmail: emailPayload.reply_to_email,
        threadId: emailPayload.thread_id,
        applicationId: emailPayload.application_id,
        jobId: emailPayload.job_id,
        companyName: emailPayload.company_name,
        createThreads: emailPayload.create_threads
      });

      const edgeFunctionStart = Date.now();
      console.log('Invoking send-bulk-email edge function...');
      
      const { data: edgeFunctionResponse, error: emailError } = await supabase.functions.invoke('send-bulk-email', {
        body: emailPayload
      });

      const edgeFunctionDuration = Date.now() - edgeFunctionStart;
      
      if (emailError) {
        console.error('EDGE FUNCTION INVOCATION FAILED:', {
          error: emailError,
          errorMessage: emailError.message,
          payload: emailPayload,
          duration: edgeFunctionDuration
        });
        throw emailError;
      }

      console.log('Edge function invoked successfully:', {
        response: edgeFunctionResponse,
        duration: edgeFunctionDuration
      });

      // Enhanced email logging with detailed tracking
      const logData = {
        user_id: user.data.user.id,
        application_id: data.applicationId || null,
        thread_id: threadId,
        recipient_email: data.recipientEmail,
        recipient_name: data.recipientName,
        subject: processedSubject,
        content: data.content,
        status: 'sent'
      };
      
      console.log('Logging email in email_logs table:', {
        userId: logData.user_id,
        applicationId: logData.application_id,
        threadId: logData.thread_id,
        recipientEmail: logData.recipient_email,
        subject: logData.subject,
        status: logData.status
      });

      const logStart = Date.now();
      const { error: logError } = await supabase
        .from('email_logs')
        .insert(logData);

      if (logError) {
        console.error('EMAIL LOGGING FAILED (non-critical):', {
          error: logError,
          logData,
          duration: Date.now() - logStart
        });
      } else {
        console.log('Email logged successfully:', {
          duration: Date.now() - logStart
        });
      }
      
      console.log('=== EMAIL SENDING COMPLETED SUCCESSFULLY ===', {
        totalDuration: Date.now() - startTime,
        recipientEmail: data.recipientEmail,
        subject: processedSubject,
        threadId
      });
      
    } catch (error: any) {
      console.error('=== EMAIL SENDING FAILED ===', {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack,
        data,
        totalDuration: Date.now() - startTime
      });
      throw error;
    }
  }
};
