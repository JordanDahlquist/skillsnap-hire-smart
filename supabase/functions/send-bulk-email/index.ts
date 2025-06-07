
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  applications: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  job: {
    id: string;
    title: string;
  };
  subject: string;
  content: string;
  template_id?: string;
  company_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user from the auth token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { 
      applications, 
      job, 
      subject, 
      content, 
      template_id, 
      company_name 
    }: BulkEmailRequest = await req.json();

    console.log(`Processing bulk email for ${applications.length} recipients`);

    const processTemplate = (text: string, application: any) => {
      return text
        .replace(/{name}/g, application.name)
        .replace(/{email}/g, application.email)
        .replace(/{position}/g, job.title)
        .replace(/{company}/g, company_name);
    };

    const emailResults = [];

    // Process emails in batches to avoid rate limits
    for (const application of applications) {
      try {
        const personalizedSubject = processTemplate(subject, application);
        const personalizedContent = processTemplate(content, application);

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: "hiring@resend.dev", // Replace with your verified domain
          to: [application.email],
          subject: personalizedSubject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="white-space: pre-wrap; line-height: 1.6;">${personalizedContent}</div>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                This email was sent from ${company_name}. 
                If you no longer wish to receive emails, please contact us.
              </p>
            </div>
          `,
        });

        // Log the email in the database
        const { error: logError } = await supabaseClient
          .from('email_logs')
          .insert({
            user_id: user.id,
            application_id: application.id,
            template_id: template_id || null,
            recipient_email: application.email,
            recipient_name: application.name,
            subject: personalizedSubject,
            content: personalizedContent,
            status: emailResponse.error ? 'failed' : 'sent',
            sent_at: new Date().toISOString(),
            error_message: emailResponse.error?.message || null
          });

        if (logError) {
          console.error('Error logging email:', logError);
        }

        emailResults.push({
          recipient: application.email,
          success: !emailResponse.error,
          error: emailResponse.error?.message || null
        });

        console.log(`Email sent to ${application.email}:`, emailResponse.error ? 'FAILED' : 'SUCCESS');

      } catch (error) {
        console.error(`Error sending email to ${application.email}:`, error);
        emailResults.push({
          recipient: application.email,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = emailResults.filter(r => r.success).length;
    const failureCount = emailResults.filter(r => !r.success).length;

    console.log(`Bulk email completed: ${successCount} sent, ${failureCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      results: emailResults,
      summary: {
        total: applications.length,
        sent: successCount,
        failed: failureCount
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

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
