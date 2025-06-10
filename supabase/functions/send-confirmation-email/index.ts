
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  name?: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { email, name, confirmationUrl }: ConfirmationEmailRequest = await req.json();

    console.log('Sending confirmation email to:', email);

    // Validate required fields
    if (!email || !confirmationUrl) {
      throw new Error('Missing required fields: email and confirmationUrl');
    }

    const firstName = name ? name.split(' ')[0] : 'there';

    // Send confirmation email via Resend API
    const emailResponse = await resend.emails.send({
      from: "Atract <noreply@atract.ai>",
      to: [email],
      subject: "Confirm your Atract account",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #007af6 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Atract!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Please confirm your email address to get started</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0; margin-bottom: 20px;">Hi ${firstName},</h2>
            
            <p style="margin-bottom: 25px; font-size: 16px;">
              Thanks for signing up for Atract! We're excited to help you transform your hiring process with AI-powered recruitment tools.
            </p>
            
            <p style="margin-bottom: 30px; font-size: 16px;">
              To complete your account setup and start your free trial, please confirm your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background: #007af6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(0,122,246,0.2);">
                Confirm Email Address
              </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 4px; font-size: 12px; color: #007af6;">
              ${confirmationUrl}
            </p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Once confirmed, you'll have access to:
              </p>
              <ul style="color: #6b7280; font-size: 14px; margin: 10px 0; padding-left: 20px;">
                <li>AI-powered job posting generator</li>
                <li>Intelligent candidate screening</li>
                <li>Automated interview scheduling</li>
                <li>Advanced hiring analytics</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This email was sent to ${email}. If you didn't create an account with Atract, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('Confirmation email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Confirmation email sent successfully",
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    
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
