
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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mailersendApiKey = Deno.env.get("MAILERSEND_API_KEY");
    if (!mailersendApiKey) {
      throw new Error('MAILERSEND_API_KEY is not configured');
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
      thread_id
    }: BulkEmailRequest = await req.json();

    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log('Sending bulk emails via MailerSend:', { 
      user_id,
      count: applications.length, 
      subject, 
      reply_to_email,
      create_threads,
      content_preview: content?.substring(0, 100) + '...'
    });

    const results = [];
    const fromEmail = reply_to_email || 'hiring@atract.ai';
    const companyName = company_name || 'Our Company';

    for (const application of applications) {
      let finalThreadId = thread_id;
      let messageStored = false;

      try {
        // Create email thread if requested and not provided
        if (create_threads && !finalThreadId) {
          finalThreadId = await createEmailThread(
            supabase,
            user_id,
            subject,
            [fromEmail, application.email],
            fromEmail
          );
        }

        // Process template variables
        const processedSubject = processTemplateVariables(
          subject,
          application.name,
          application.email,
          job.title,
          companyName
        );

        const processedContent = processTemplateVariables(
          content,
          application.name,
          application.email,
          job.title,
          companyName
        );

        // Add thread tracking to subject if we have a thread
        const finalSubject = finalThreadId 
          ? `${processedSubject} [Thread:${finalThreadId}]`
          : processedSubject;

        // Store message in database FIRST (before sending email)
        if (finalThreadId) {
          await storeEmailMessage(
            supabase,
            finalThreadId,
            fromEmail,
            application.email,
            finalSubject,
            processedContent
          );
          messageStored = true;
        }

        // Format content for email sending with enhanced bullet processing
        const formattedHtmlContent = createHtmlContent(processedContent);
        
        console.log('Content processing debug:', {
          original: processedContent?.substring(0, 200),
          formatted: formattedHtmlContent?.substring(0, 200)
        });
        
        // Create email payload
        const emailPayload = createEmailPayload(
          fromEmail,
          companyName,
          application.email,
          application.name,
          finalSubject,
          formattedHtmlContent
        );

        // Send email via MailerSend
        const emailResult = await sendEmailViaMailerSend(emailPayload, mailersendApiKey);

        // Log the email attempt
        await logEmailAttempt(
          supabase,
          user_id,
          finalThreadId,
          application.email,
          application.name,
          finalSubject,
          processedContent,
          template_id,
          emailResult.success ? 'sent' : 'failed'
        );

        results.push({
          email: application.email,
          success: messageStored, // Success is based on message storage, not email sending
          thread_id: finalThreadId,
          message_id: emailResult.result?.message_id || emailResult.result?.id,
          email_sent: emailResult.success,
          email_error: emailResult.error
        });

      } catch (error) {
        console.error(`Failed to process email for ${application.email}:`, error);
        results.push({
          email: application.email,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Bulk email completed: ${successCount}/${applications.length} processed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary: {
          total: applications.length,
          processed: successCount,
          failed: applications.length - successCount
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-bulk-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
