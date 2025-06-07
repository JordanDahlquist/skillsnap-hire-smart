
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

const createEmailTemplate = (content: string, companyName: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Message from ${companyName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 40px;
          text-align: center;
        }
        .company-name {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .email-body {
          padding: 40px;
        }
        .content {
          white-space: pre-wrap;
          font-size: 16px;
          line-height: 1.8;
          color: #374151;
          margin-bottom: 30px;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e5e7eb, transparent);
          margin: 30px 0;
        }
        .email-footer {
          background-color: #f9fafb;
          padding: 30px 40px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          color: #6b7280;
          font-size: 14px;
          margin: 0 0 15px 0;
        }
        .unsubscribe-text {
          color: #9ca3af;
          font-size: 12px;
          margin: 0;
        }
        .professional-signature {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
          .email-header, .email-body, .email-footer {
            padding: 20px;
          }
          .company-name {
            font-size: 20px;
            letter-spacing: 1px;
          }
          .content {
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1 class="company-name">${companyName}</h1>
        </div>
        
        <div class="email-body">
          <div class="content">${content}</div>
          
          <div class="divider"></div>
          
          <div class="professional-signature">
            <strong>Best regards,</strong><br>
            The ${companyName} Hiring Team
          </div>
        </div>
        
        <div class="email-footer">
          <p class="footer-text">
            This email was sent from <strong>${companyName}</strong> regarding your job application.
          </p>
          <p class="unsubscribe-text">
            If you no longer wish to receive emails about this application, please contact us directly.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

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
        const htmlContent = createEmailTemplate(personalizedContent, company_name);

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: `${company_name} <onboarding@resend.dev>`, // You can update this to your verified domain
          to: [application.email],
          subject: personalizedSubject,
          html: htmlContent,
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
