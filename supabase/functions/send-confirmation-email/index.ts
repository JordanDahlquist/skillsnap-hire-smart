
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

    // Send enhanced confirmation email via Resend API
    const emailResponse = await resend.emails.send({
      from: "Atract <noreply@atract.ai>",
      to: [email],
      subject: "🚀 Welcome to Atract - Confirm your account",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Atract</title>
          <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <!-- Preheader text -->
          <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
            Welcome to Atract! Confirm your email to start transforming your hiring process with AI-powered recruitment tools.
          </div>
          
          <!-- Email Container -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <!-- Main Content Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header with Gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #007af6 0%, #8b5cf6 50%, #06b6d4 100%); padding: 0; position: relative;">
                      <!-- Gradient overlay pattern -->
                      <div style="background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>'); padding: 50px 40px; text-align: center; position: relative;">
                        <!-- Logo -->
                        <div style="margin-bottom: 30px;">
                          <div style="display: inline-block; width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.15); border-radius: 16px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); padding: 12px;">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="white"/>
                              <path d="M19 15L19.5 17L21.5 17.5L19.5 18L19 20L18.5 18L16.5 17.5L18.5 17L19 15Z" fill="white"/>
                              <path d="M5 6L5.5 7.5L7 8L5.5 8.5L5 10L4.5 8.5L3 8L4.5 7.5L5 6Z" fill="white"/>
                            </svg>
                          </div>
                        </div>
                        
                        <!-- Main Heading -->
                        <h1 style="color: white; margin: 0 0 16px 0; font-size: 32px; font-weight: 700; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                          Welcome to Atract!
                        </h1>
                        
                        <!-- Subheading -->
                        <p style="color: rgba(255, 255, 255, 0.95); margin: 0; font-size: 18px; font-weight: 400; line-height: 1.5;">
                          You're one step away from revolutionizing your hiring process
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <!-- Greeting -->
                      <h2 style="color: #1e293b; margin: 0 0 24px 0; font-size: 24px; font-weight: 600; line-height: 1.3;">
                        Hi ${firstName} 👋
                      </h2>
                      
                      <!-- Main Message -->
                      <p style="color: #475569; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                        Thank you for joining Atract! We're thrilled to help you transform your recruitment process with our AI-powered tools. To get started with your free trial, please confirm your email address.
                      </p>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 40px 0;">
                        <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #007af6 0%, #0066cc 100%); color: white; text-decoration: none; padding: 18px 36px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 122, 246, 0.3); transition: all 0.2s ease;">
                          ✨ Confirm Email Address
                        </a>
                      </div>
                      
                      <!-- Alternative Link -->
                      <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 30px 0;">
                        <p style="color: #64748b; margin: 0 0 12px 0; font-size: 14px; font-weight: 500;">
                          Button not working? Copy and paste this link:
                        </p>
                        <p style="word-break: break-all; color: #007af6; font-size: 12px; margin: 0; font-family: 'Courier New', monospace; background-color: white; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                          ${confirmationUrl}
                        </p>
                      </div>
                      
                      <!-- What's Next Section -->
                      <div style="border-top: 1px solid #e2e8f0; padding-top: 30px; margin-top: 40px;">
                        <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                          🎯 What's waiting for you:
                        </h3>
                        
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="padding: 12px 0; vertical-align: top; width: 40px;">
                              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <span style="color: white; font-size: 16px;">🤖</span>
                              </div>
                            </td>
                            <td style="padding: 12px 0 12px 16px; vertical-align: top;">
                              <h4 style="color: #1e293b; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">AI-Powered Job Creation</h4>
                              <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">Generate compelling job posts in seconds with intelligent content creation</p>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="padding: 12px 0; vertical-align: top; width: 40px;">
                              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <span style="color: white; font-size: 16px;">⚡</span>
                              </div>
                            </td>
                            <td style="padding: 12px 0 12px 16px; vertical-align: top;">
                              <h4 style="color: #1e293b; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Smart Candidate Screening</h4>
                              <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">Automatically rank and analyze candidates with AI-driven insights</p>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="padding: 12px 0; vertical-align: top; width: 40px;">
                              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <span style="color: white; font-size: 16px;">📊</span>
                              </div>
                            </td>
                            <td style="padding: 12px 0 12px 16px; vertical-align: top;">
                              <h4 style="color: #1e293b; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Advanced Analytics</h4>
                              <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">Track hiring performance with detailed insights and reports</p>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Social Proof -->
                      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin: 40px 0; text-align: center; border: 1px solid #f59e0b;">
                        <p style="color: #92400e; margin: 0 0 8px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                          🌟 Join 1000+ Companies
                        </p>
                        <p style="color: #78350f; margin: 0; font-size: 16px; font-weight: 500;">
                          Already transforming their hiring with Atract
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <!-- Help Section -->
                      <div style="margin-bottom: 24px;">
                        <h4 style="color: #374151; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
                          Need help? We're here for you! 🚀
                        </h4>
                        <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
                          • Check your spam folder if you don't see this email<br>
                          • Make sure <strong>${email}</strong> is correct<br>
                          • Add noreply@atract.ai to your contacts<br>
                          • Try a different browser if the link doesn't work
                        </p>
                      </div>
                      
                      <!-- Company Info -->
                      <div style="border-top: 1px solid #d1d5db; padding-top: 24px;">
                        <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.5;">
                          This email was sent to <strong>${email}</strong><br>
                          If you didn't create an account with Atract, please ignore this email.
                        </p>
                        <p style="color: #9ca3af; margin: 16px 0 0 0; font-size: 12px;">
                          © 2024 Atract. All rights reserved.
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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
