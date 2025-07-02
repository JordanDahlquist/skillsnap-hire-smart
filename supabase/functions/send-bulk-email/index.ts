
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  formatEmailContent, 
  createHtmlContent, 
  processTemplateVariables 
} from './contentProcessing.ts';
import { 
  sendEmailViaMailerSend, 
  createEmailPayload 
} from './emailSending.ts';
import { 
  createEmailThread, 
  storeEmailMessage, 
  logEmailAttempt 
} from './databaseOperations.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Application {
  email: string;
  name: string;
}

interface Job {
  title: string;
}

interface BulkEmailRequest {
  user_id: string;
  applications: Application[];
  job: Job;
  subject: string;
  content: string;
  template_id?: string;
  company_name?: string;
  reply_to_email?: string;
  create_threads?: boolean;
  thread_id?: string;
  application_id?: string;
  job_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const requestStartTime = Date.now();
  console.log('=== SEND-BULK-EMAIL EDGE FUNCTION STARTED ===');
  console.log('Request received at:', new Date().toISOString());
  console.log('Request method:', req.method);
  
  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking environment variables...');
    const mailersendApiKey = Deno.env.get("MAILERSEND_API_KEY");
    if (!mailersendApiKey) {
      console.error('CRITICAL: MAILERSEND_API_KEY is not configured');
      throw new Error('MAILERSEND_API_KEY is not configured');
    }
    console.log('MailerSend API key found:', mailersendApiKey ? 'Yes' : 'No');

    // Create Supabase client with service role key
    console.log('Creating Supabase client...');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log('Supabase client created successfully');

    console.log('Parsing request body...');
    const requestBody: BulkEmailRequest = await req.json();
    
    const { 
      user_id,
      applications, 
      job, 
      subject, 
      content, 
      template_id, 
      company_name,
      reply_to_email,
      create_threads = false,
      thread_id,
      application_id,
      job_id
    } = requestBody;

    console.log('Request payload parsed:', {
      user_id,
      applicationCount: applications?.length || 0,
      jobTitle: job?.title,
      subject,
      contentLength: content?.length || 0,
      template_id,
      company_name,
      reply_to_email,
      create_threads,
      thread_id,
      application_id,
      job_id
    });

    if (!user_id) {
      console.error('VALIDATION FAILED: User ID is required');
      throw new Error('User ID is required');
    }

    if (!applications || applications.length === 0) {
      console.error('VALIDATION FAILED: No applications provided');
      throw new Error('No applications provided');
    }

    console.log('Validation passed - processing emails for', applications.length, 'recipients');

    const results = [];
    const fromEmail = reply_to_email || 'hiring@atract.ai';
    
    // Use proper company name with fallback
    const finalCompanyName = company_name || 'Your Company';
    console.log('Using company name for branding:', finalCompanyName);

    console.log('Email configuration:', {
      fromEmail,
      companyName: finalCompanyName,
      createThreads: create_threads
    });

    for (let i = 0; i < applications.length; i++) {
      const application = applications[i];
      const applicationStartTime = Date.now();
      
      console.log(`\n=== PROCESSING APPLICATION ${i + 1}/${applications.length} ===`);
      console.log('Application details:', {
        email: application.email,
        name: application.name
      });

      let finalThreadId = thread_id;
      let messageStored = false;

      try {
        // Create email thread if requested and not provided
        if (create_threads && !finalThreadId) {
          console.log('Creating new email thread...');
          const threadCreationStart = Date.now();
          
          finalThreadId = await createEmailThread(
            supabase,
            user_id,
            subject,
            [fromEmail, application.email],
            fromEmail
          );
          
          console.log('Thread created:', {
            threadId: finalThreadId,
            duration: Date.now() - threadCreationStart
          });
        }

        // Process template variables
        console.log('Processing template variables...');
        const processedSubject = processTemplateVariables(
          subject,
          application.name,
          application.email,
          job.title,
          finalCompanyName
        );

        const processedContent = processTemplateVariables(
          content,
          application.name,
          application.email,
          job.title,
          finalCompanyName
        );

        console.log('Template variables processed:', {
          originalSubject: subject,
          processedSubject,
          contentLength: processedContent?.length || 0,
          companyName: finalCompanyName
        });

        // Clean subject line - NO thread ID for recipient
        const cleanSubject = processedSubject;
        console.log('Clean subject line for recipient:', cleanSubject);

        // Store message in database FIRST (before sending email)
        if (finalThreadId) {
          console.log('Storing message in database...');
          const messageStoreStart = Date.now();
          
          await storeEmailMessage(
            supabase,
            finalThreadId,
            fromEmail,
            application.email,
            cleanSubject,
            processedContent
          );
          
          messageStored = true;
          console.log('Message stored successfully:', {
            duration: Date.now() - messageStoreStart
          });
        } else {
          console.log('No thread ID - skipping message storage');
        }

        // Format content for email sending with enhanced bullet processing
        console.log('Formatting HTML content...');
        const formattedHtmlContent = createHtmlContent(processedContent);
        
        console.log('Content formatting completed:', {
          originalLength: processedContent?.length || 0,
          formattedLength: formattedHtmlContent?.length || 0
        });
        
        // Create email payload with proper company branding
        console.log('Creating email payload for MailerSend...');
        const emailPayload = createEmailPayload(
          fromEmail,
          finalCompanyName, // Use proper company name
          application.email,
          application.name,
          cleanSubject, // Clean subject without thread ID
          formattedHtmlContent
        );

        console.log('Email payload created:', {
          from: emailPayload.from,
          to: emailPayload.to,
          subject: emailPayload.subject,
          htmlLength: emailPayload.html?.length || 0
        });

        // Send email via MailerSend
        console.log('Sending email via MailerSend...');
        const emailSendStart = Date.now();
        
        const emailResult = await sendEmailViaMailerSend(emailPayload, mailersendApiKey);
        
        const emailSendDuration = Date.now() - emailSendStart;
        console.log('MailerSend result:', {
          success: emailResult.success,
          duration: emailSendDuration,
          error: emailResult.error,
          messageId: emailResult.result?.message_id || emailResult.result?.id
        });

        // Log the email attempt
        console.log('Logging email attempt...');
        const logStart = Date.now();
        
        await logEmailAttempt(
          supabase,
          user_id,
          finalThreadId,
          application.email,
          application.name,
          cleanSubject,
          processedContent,
          template_id,
          emailResult.success ? 'sent' : 'failed'
        );
        
        console.log('Email attempt logged:', {
          duration: Date.now() - logStart
        });

        const applicationResult = {
          email: application.email,
          success: messageStored,
          thread_id: finalThreadId,
          message_id: emailResult.result?.message_id || emailResult.result?.id,
          email_sent: emailResult.success,
          email_error: emailResult.error,
          processing_duration: Date.now() - applicationStartTime
        };
        
        results.push(applicationResult);
        
        console.log(`Application ${i + 1} processed:`, applicationResult);

      } catch (error: any) {
        console.error(`FAILED to process application ${i + 1}:`, {
          email: application.email,
          error: error.message,
          stack: error.stack,
          duration: Date.now() - applicationStartTime
        });
        
        results.push({
          email: application.email,
          success: false,
          error: error.message,
          processing_duration: Date.now() - applicationStartTime
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalDuration = Date.now() - requestStartTime;
    
    console.log('=== BULK EMAIL PROCESSING COMPLETED ===');
    console.log('Summary:', {
      total: applications.length,
      successful: successCount,
      failed: applications.length - successCount,
      totalDuration,
      averageDuration: Math.round(totalDuration / applications.length)
    });

    const response = {
      success: true,
      results,
      summary: {
        total: applications.length,
        processed: successCount,
        failed: applications.length - successCount,
        duration: totalDuration
      }
    };

    console.log('Returning success response');
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    const errorDuration = Date.now() - requestStartTime;
    console.error("=== EDGE FUNCTION ERROR ===", {
      error: error.message,
      stack: error.stack,
      duration: errorDuration
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        duration: errorDuration
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
