
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

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  path?: string;
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
  attachments?: AttachmentFile[];
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
      thread_id,
      attachments = []
    }: BulkEmailRequest = await req.json();

    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log('Processing bulk email request:', { 
      user_id,
      count: applications.length, 
      subject, 
      reply_to_email,
      create_threads,
      attachments_count: attachments.length
    });

    // Process attachments with improved error handling
    const processedAttachments = [];
    const failedAttachments = [];

    for (const attachment of attachments) {
      try {
        console.log(`Processing attachment: ${attachment.name} (ID: ${attachment.id})`);
        
        // Use the exact same path format as frontend: user_id/fileId-fileName
        const filePath = `${user_id}/${attachment.id}-${attachment.name}`;
        console.log(`Attempting to download from path: ${filePath}`);
        
        // Verify file exists first
        const { data: fileList, error: listError } = await supabase.storage
          .from('email-attachments')
          .list(user_id, {
            search: `${attachment.id}-${attachment.name}`
          });

        if (listError) {
          console.error(`Error listing files for ${attachment.name}:`, listError);
          failedAttachments.push({ name: attachment.name, error: 'File not found in storage' });
          continue;
        }

        if (!fileList || fileList.length === 0) {
          console.error(`File not found in storage: ${filePath}`);
          failedAttachments.push({ name: attachment.name, error: 'File not found in storage' });
          continue;
        }

        console.log(`File found in storage: ${attachment.name}`);

        // Download the file
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('email-attachments')
          .download(filePath);

        if (downloadError) {
          console.error(`Failed to download ${attachment.name}:`, downloadError);
          failedAttachments.push({ name: attachment.name, error: downloadError.message });
          continue;
        }

        if (!fileData) {
          console.error(`No file data returned for: ${attachment.name}`);
          failedAttachments.push({ name: attachment.name, error: 'No file data returned' });
          continue;
        }

        // Convert to base64 with proper error handling
        const arrayBuffer = await fileData.arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
          console.error(`Empty file data for: ${attachment.name}`);
          failedAttachments.push({ name: attachment.name, error: 'Empty file data' });
          continue;
        }

        const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        // Create MailerSend compatible attachment object
        const mailersendAttachment = {
          name: attachment.name,
          content: base64Content,
          disposition: "attachment"
        };

        // Add content-type if available
        if (attachment.type) {
          mailersendAttachment.type = attachment.type;
        }

        processedAttachments.push(mailersendAttachment);
        console.log(`Successfully processed attachment: ${attachment.name} (${arrayBuffer.byteLength} bytes)`);
        
      } catch (error) {
        console.error(`Error processing attachment ${attachment.name}:`, error);
        failedAttachments.push({ name: attachment.name, error: error.message });
      }
    }

    console.log(`Attachment processing complete: ${processedAttachments.length} successful, ${failedAttachments.length} failed`);
    if (failedAttachments.length > 0) {
      console.error('Failed attachments:', failedAttachments);
    }

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
          .replace(/{email}/g, application.email)
          .replace(/{position}/g, job.title)
          .replace(/{company}/g, companyName);

        const processedContent = content
          .replace(/{name}/g, application.name)
          .replace(/{email}/g, application.email)
          .replace(/{position}/g, job.title)
          .replace(/{company}/g, companyName);

        // Add thread tracking to subject if we have a thread
        const finalSubject = finalThreadId 
          ? `${processedSubject} [Thread:${finalThreadId}]`
          : processedSubject;

        // Store message in database FIRST
        if (finalThreadId) {
          console.log('Storing message in database for thread:', finalThreadId);
          const { error: messageError } = await supabase
            .from('email_messages')
            .insert({
              thread_id: finalThreadId,
              sender_email: fromEmail,
              recipient_email: application.email,
              subject: finalSubject,
              content: processedContent,
              direction: 'outbound',
              message_type: 'original',
              is_read: true,
              attachments: attachments.map(att => ({
                id: att.id,
                name: att.name,
                size: att.size,
                type: att.type,
                url: att.url
              }))
            });

          if (messageError) {
            console.error('Failed to store message:', messageError);
            throw messageError;
          } else {
            console.log('Message stored successfully in database');
            messageStored = true;
          }
        }

        // Prepare email payload for MailerSend
        const emailPayload: any = {
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
              ${processedContent.replace(/\n/g, '<br>')}
            </div>
          `,
          reply_to: {
            email: fromEmail,
            name: companyName
          }
        };

        // Add attachments to email payload if any were successfully processed
        if (processedAttachments.length > 0) {
          emailPayload.attachments = processedAttachments;
          console.log(`Adding ${processedAttachments.length} attachments to email for ${application.email}`);
        }

        let emailResult = null;
        let emailSendError = null;

        try {
          console.log('Sending email via MailerSend API for:', application.email);
          const emailResponse = await fetch('https://api.mailersend.com/v1/email', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${mailersendApiKey}`,
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(emailPayload)
          });

          console.log(`MailerSend response status: ${emailResponse.status}`);

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error(`MailerSend API error for ${application.email}:`, errorText);
            throw new Error(`MailerSend API error: ${emailResponse.status} - ${errorText}`);
          }

          const responseText = await emailResponse.text();
          console.log('MailerSend response:', responseText);
          
          if (responseText.trim()) {
            try {
              emailResult = JSON.parse(responseText);
              console.log('Email sent successfully via MailerSend:', emailResult);
            } catch (parseError) {
              console.warn('Failed to parse MailerSend response as JSON:', responseText);
              emailResult = { message: 'Email sent', raw_response: responseText };
            }
          } else {
            console.log('Empty response from MailerSend (likely success)');
            emailResult = { message: 'Email sent (empty response)' };
          }
        } catch (error) {
          console.error('Failed to send email via MailerSend:', error);
          emailSendError = error;
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
            content: processedContent,
            template_id: template_id || null,
            status: emailSendError ? 'failed' : 'sent',
            sent_at: new Date().toISOString()
          });

        if (logError) {
          console.error('Failed to log email:', logError);
        }

        results.push({
          email: application.email,
          success: messageStored && !emailSendError,
          thread_id: finalThreadId,
          message_id: emailResult?.message_id || emailResult?.id,
          email_sent: !emailSendError,
          email_error: emailSendError?.message,
          attachments_processed: processedAttachments.length,
          attachments_failed: failedAttachments.filter(f => f.name).length
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
          failed: applications.length - successCount,
          attachments_processed: processedAttachments.length,
          attachments_failed: failedAttachments.length
        },
        attachment_errors: failedAttachments
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
