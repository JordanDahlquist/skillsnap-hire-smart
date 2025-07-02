
// Email sending utilities

interface EmailPayload {
  from: { email: string; name: string };
  to: { email: string; name: string }[];
  subject: string;
  html: string;
  reply_to: { email: string; name: string };
}

export const sendEmailViaMailerSend = async (
  payload: EmailPayload,
  apiKey: string
): Promise<{ success: boolean; result?: any; error?: string }> => {
  try {
    const emailResponse = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(payload)
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
        const emailResult = JSON.parse(responseText);
        console.log('Email sent successfully via MailerSend:', emailResult);
        return { success: true, result: emailResult };
      } catch (parseError) {
        console.warn('Failed to parse MailerSend response as JSON, but email may have been sent:', responseText);
        return { success: true, result: { message: 'Email sent (response parsing failed)', raw_response: responseText } };
      }
    } else {
      console.warn('Empty response from MailerSend, but status was OK');
      return { success: true, result: { message: 'Email sent (empty response)' } };
    }
  } catch (error) {
    console.error('Failed to send email via MailerSend:', error);
    return { success: false, error: error.message };
  }
};

export const createEmailPayload = (
  fromEmail: string,
  companyName: string,
  recipientEmail: string,
  recipientName: string,
  subject: string,
  htmlContent: string
): EmailPayload => {
  return {
    from: {
      email: fromEmail,
      name: companyName
    },
    to: [{
      email: recipientEmail,
      name: recipientName
    }],
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        ${htmlContent}
      </div>
    `,
    reply_to: {
      email: fromEmail,
      name: companyName
    }
  };
};
