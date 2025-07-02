
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

// Helper function to format content with proper bullet points and line breaks
const formatEmailContent = (content: string): string => {
  if (!content) return '';
  
  // Convert rich text to plain text for email while preserving structure
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  let plainText = tempDiv.textContent || tempDiv.innerText || content;
  
  // Convert line breaks to proper format
  plainText = plainText.replace(/\n/g, '\n');
  
  // Convert dash bullets to proper bullet points
  plainText = plainText.replace(/^-\s*(.+)$/gm, '• $1');
  plainText = plainText.replace(/\n-\s*(.+)/g, '\n• $1');
  
  // Convert asterisk bullets to proper bullet points
  plainText = plainText.replace(/^\*\s*(.+)$/gm, '• $1');
  plainText = plainText.replace(/\n\*\s*(.+)/g, '\n• $1');
  
  return plainText;
};

// Enhanced function to create HTML version with proper bullet formatting
const createHtmlContent = (content: string): string => {
  if (!content) return '';
  
  let htmlContent = content;
  
  // Handle HTML div tags with bullets (from rich text editor)
  // Convert <div>-bullet</div> to <div>• bullet</div>
  htmlContent = htmlContent.replace(/<div>-\s*([^<]+)<\/div>/gi, '<div>• $1</div>');
  htmlContent = htmlContent.replace(/<div>\*\s*([^<]+)<\/div>/gi, '<div>• $1</div>');
  
  // Handle HTML p tags with bullets
  htmlContent = htmlContent.replace(/<p>-\s*([^<]+)<\/p>/gi, '<p>• $1</p>');
  htmlContent = htmlContent.replace(/<p>\*\s*([^<]+)<\/p>/gi, '<p>• $1</p>');
  
  // Handle line breaks followed by bullets
  htmlContent = htmlContent.replace(/<br\s*\/?>\s*-\s*([^<\n]+)/gi, '<br>• $1');
  htmlContent = htmlContent.replace(/<br\s*\/?>\s*\*\s*([^<\n]+)/gi, '<br>• $1');
  
  // Handle plain text bullets at start of content or after line breaks
  htmlContent = htmlContent.replace(/^-\s*(.+)$/gm, '• $1');
  htmlContent = htmlContent.replace(/\n-\s*(.+)/g, '\n• $1');
  htmlContent = htmlContent.replace(/^-([^\s])(.*)$/gm, '• $1$2'); // Handle -bullet without space
  htmlContent = htmlContent.replace(/\n-([^\s])(.*)$/gm, '\n• $1$2'); // Handle -bullet without space after newline
  
  htmlContent = htmlContent.replace(/^\*\s*(.+)$/gm, '• $1');
  htmlContent = htmlContent.replace(/\n\*\s*(.+)/g, '\n• $1');
  htmlContent = htmlContent.replace(/^\*([^\s])(.*)$/gm, '• $1$2'); // Handle *bullet without space
  htmlContent = htmlContent.replace(/\n\*([^\s])(.*)$/gm, '\n• $1$2'); // Handle *bullet without space after newline
  
  // Convert line breaks to HTML breaks if not already HTML
  if (!htmlContent.includes('<') || htmlContent.includes('\n')) {
    htmlContent = htmlContent.replace(/\n/g, '<br>');
  }
  
  return htmlContent;
};

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
          const { data: thread, error: threadError } = await supabase
            .from('email_threads')
            .insert({
              user_id: user_id,
              subject: subject,
              participants: [fromEmail, application.email],
              reply_to_email: fromEmail,
              last_message_at: new Date().toISOString(),
              unread_count: 0,
              status: 'active'
            })
            .select('id')
            .single();

          if (threadError) {
            console.error('Failed to create thread:', threadError);
            throw threadError;
          }

          finalThreadId = thread.id;
          console.log('Created thread:', finalThreadId);
        }

        // Process template variables
        const processedSubject = subject
          .replace(/{name}/g, application.name)
          .replace(/{candidateName}/g, application.name)
          .replace(/{email}/g, application.email)
          .replace(/{candidateEmail}/g, application.email)
          .replace(/{position}/g, job.title)
          .replace(/{jobTitle}/g, job.title)
          .replace(/{company}/g, companyName)
          .replace(/{companyName}/g, companyName);

        const processedContent = content
          .replace(/{name}/g, application.name)
          .replace(/{candidateName}/g, application.name)
          .replace(/{email}/g, application.email)
          .replace(/{candidateEmail}/g, application.email)
          .replace(/{position}/g, job.title)
          .replace(/{jobTitle}/g, job.title)
          .replace(/{company}/g, companyName)
          .replace(/{companyName}/g, companyName);

        // Add thread tracking to subject if we have a thread
        const finalSubject = finalThreadId 
          ? `${processedSubject} [Thread:${finalThreadId}]`
          : processedSubject;

        // Store message in database FIRST (before sending email)
        if (finalThreadId) {
          console.log('Storing message in database for thread:', finalThreadId);
          const { error: messageError } = await supabase
            .from('email_messages')
            .insert({
              thread_id: finalThreadId,
              sender_email: fromEmail,
              recipient_email: application.email,
              subject: finalSubject,
              content: processedContent, // Store original content
              direction: 'outbound',
              message_type: 'original',
              is_read: true
            });

          if (messageError) {
            console.error('Failed to store message:', messageError);
            throw messageError;
          } else {
            console.log('Message stored successfully in database');
            messageStored = true;
          }
        }

        // Format content for email sending with enhanced bullet processing
        const formattedHtmlContent = createHtmlContent(processedContent);
        
        console.log('Content processing debug:', {
          original: processedContent?.substring(0, 200),
          formatted: formattedHtmlContent?.substring(0, 200)
        });
        
        // Now attempt to send email via MailerSend API
        const emailPayload = {
          from: {
            email: fromEmail,
            name: companyName
          },
          to: [{
            email: application.email,
            name: application.name
          }],
          subject: finalSubject,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              ${formattedHtmlContent}
            </div>
          `,
          reply_to: {
            email: fromEmail,
            name: companyName
          }
        };

        let emailResult = null;
        let emailSendError = null;

        try {
          const emailResponse = await fetch('https://api.mailersend.com/v1/email', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${mailersendApiKey}`,
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(emailPayload)
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            throw new Error(`MailerSend API error: ${emailResponse.status} - ${errorText}`);
          }

          // Handle potentially empty or invalid JSON response
          const responseText = await emailResponse.text();
          console.log('MailerSend response text:', responseText);
          
          if (responseText.trim()) {
            try {
              emailResult = JSON.parse(responseText);
              console.log('Email sent successfully via MailerSend:', emailResult);
            } catch (parseError) {
              console.warn('Failed to parse MailerSend response as JSON, but email may have been sent:', responseText);
              emailResult = { message: 'Email sent (response parsing failed)', raw_response: responseText };
            }
          } else {
            console.warn('Empty response from MailerSend, but status was OK');
            emailResult = { message: 'Email sent (empty response)' };
          }
        } catch (error) {
          console.error('Failed to send email via MailerSend:', error);
          emailSendError = error;
          // Don't throw here - we still want to log the email and show success to user
        }

        // Log the email attempt
        const { error: logError } = await supabase
          .from('email_logs')
          .insert({
            user_id: user_id,
            thread_id: finalThreadId,
            recipient_email: application.email,
            recipient_name: application.name,
            subject: finalSubject,
            content: processedContent, // Store original content
            template_id: template_id || null,
            status: emailSendError ? 'failed' : 'sent',
            sent_at: new Date().toISOString()
          });

        if (logError) {
          console.error('Failed to log email:', logError);
        }

        results.push({
          email: application.email,
          success: messageStored, // Success is based on message storage, not email sending
          thread_id: finalThreadId,
          message_id: emailResult?.message_id || emailResult?.id,
          email_sent: !emailSendError,
          email_error: emailSendError?.message
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
