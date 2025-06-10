
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  company: string;
  phone?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mailersendApiKey = Deno.env.get("MAILERSEND_API_KEY");
    if (!mailersendApiKey) {
      throw new Error('MAILERSEND_API_KEY is not configured');
    }

    const { name, email, company, phone, message }: ContactFormRequest = await req.json();

    console.log('Processing contact form submission:', { name, email, company });

    // Validate required fields
    if (!name || !email || !company || !message) {
      throw new Error('Missing required fields');
    }

    // Send email via MailerSend API
    const emailPayload = {
      from: {
        email: "contact@atract.ai",
        name: "Atract Contact Form"
      },
      to: [{
        email: "jordan@aeonmarketing.co",
        name: "Jordan"
      }],
      subject: `New Contact Form Submission from ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #007af6 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0; margin-bottom: 20px;">Contact Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #007af6;">${email}</a></p>
              <p style="margin: 0 0 10px 0;"><strong>Company:</strong> ${company}</p>
              ${phone ? `<p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
            </div>
            
            <h3 style="color: #333; margin-bottom: 15px;">Message</h3>
            <div style="background: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This message was sent from the Atract contact form at ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      `,
      reply_to: {
        email: email,
        name: name
      }
    };

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

    const emailResult = await emailResponse.json();
    console.log('Contact email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Contact form submitted successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    
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
