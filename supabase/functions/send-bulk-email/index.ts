
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

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
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
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

    console.log('Sending bulk emails:', { 
      count: applications.length, 
      subject, 
      reply_to_email,
      create_threads 
    });

    // Get current user for thread creation
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const results = [];
    const fromEmail = reply_to_email || 'hiring@atract.ai';
    const companyName = company_name || 'Our Company';

    for (const application of applications) {
      try {
        let finalThreadId = thread_id;

        // Create email thread if requested and not provided
        if (create_threads && !finalThreadId) {
          const { data: thread, error: threadError } = await supabase
            .from('email_threads')
            .insert({
              user_id: user.id,
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

        // Send email via Resend
        const emailResult = await resend.emails.send({
          from: `${companyName} <${fromEmail}>`,
          to: [application.email],
          subject: finalSubject,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              ${processedContent.replace(/\n/g, '<br>')}
            </div>
          `,
          reply_to: fromEmail,
        });

        console.log('Email sent successfully:', emailResult);

        // Store message in database if we have a thread
        if (finalThreadId) {
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
              is_read: true
            });

          if (messageError) {
            console.error('Failed to store message:', messageError);
          }
        }

        // Log the email
        const { error: logError } = await supabase
          .from('email_logs')
          .insert({
            user_id: user.id,
            thread_id: finalThreadId,
            recipient_email: application.email,
            recipient_name: application.name,
            subject: finalSubject,
            content: processedContent,
            template_id: template_id || null,
            status: 'sent',
            sent_at: new Date().toISOString()
          });

        if (logError) {
          console.error('Failed to log email:', logError);
        }

        results.push({
          email: application.email,
          success: true,
          thread_id: finalThreadId,
          message_id: emailResult.data?.id
        });

      } catch (error) {
        console.error(`Failed to send email to ${application.email}:`, error);
        results.push({
          email: application.email,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Bulk email completed: ${successCount}/${applications.length} sent successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary: {
          total: applications.length,
          sent: successCount,
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
