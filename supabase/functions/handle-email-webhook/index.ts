
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MailerSendWebhook {
  type: string;
  inbound_id: string;
  url: string;
  created_at: string;
  data: {
    object: string;
    id: string;
    recipients: {
      to: {
        raw: string;
        data: Array<{
          name: string;
          email: string;
        }>;
      };
      rcptTo: Array<{
        email: string;
      }>;
    };
    from: {
      raw: string;
      name: string;
      email: string;
    };
    sender: {
      email: string;
    };
    subject: string;
    date: string;
    headers: Record<string, any>;
    text: string;
    html: string;
    raw: string;
  };
}

interface IncomingEmail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  reply_to?: string;
  in_reply_to?: string;
  references?: string;
  message_id?: string;
}

// Simple content cleaning function for webhook use
const cleanEmailContent = (content: string): string => {
  if (!content) return '';

  let cleanedContent = content;

  // Remove common email headers and metadata
  cleanedContent = cleanedContent.replace(/^(From|To|Subject|Date|Sent|Reply-To|Cc|Bcc):.*$/gm, '');
  
  // Remove "On [date] at [time], [sender] wrote:" patterns
  cleanedContent = cleanedContent.replace(/On .+? at .+?, .+? wrote:/g, '');
  cleanedContent = cleanedContent.replace(/On .+?, .+? wrote:/g, '');
  cleanedContent = cleanedContent.replace(/\d{1,2}\/\d{1,2}\/\d{4}.*?wrote:/g, '');
  
  // Remove email signatures
  cleanedContent = cleanedContent.replace(/--\s*\n[\s\S]*$/m, '');
  cleanedContent = cleanedContent.replace(/Best regards?,?\s*\n[\s\S]*$/mi, '');
  cleanedContent = cleanedContent.replace(/Sincerely,?\s*\n[\s\S]*$/mi, '');
  cleanedContent = cleanedContent.replace(/Thanks?,?\s*\n[\s\S]*$/mi, '');
  
  // Remove Superhuman signatures
  cleanedContent = cleanedContent.replace(/Sent via Superhuman.*$/mi, '');
  cleanedContent = cleanedContent.replace(/https:\/\/sprh\.mn\/.*$/gm, '');
  
  // Remove mobile signatures
  cleanedContent = cleanedContent.replace(/Sent from my iPhone.*$/mi, '');
  cleanedContent = cleanedContent.replace(/Sent from my Android.*$/mi, '');
  cleanedContent = cleanedContent.replace(/Get Outlook for.*$/mi, '');
  
  // Remove quoted text markers
  cleanedContent = cleanedContent.replace(/^>\s?/gm, '');
  cleanedContent = cleanedContent.replace(/^>+.*$/gm, '');
  
  // Remove forwarded message indicators
  cleanedContent = cleanedContent.replace(/---------- Forwarded message ---------/g, '');
  cleanedContent = cleanedContent.replace(/----- Original Message -----/g, '');
  
  // Remove excessive whitespace
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n+/g, '\n\n');
  cleanedContent = cleanedContent.replace(/^\s+|\s+$/g, '');
  
  return cleanedContent.trim();
};

const handler = async (req: Request): Promise<Response> => {
  console.log('=== EMAIL WEBHOOK HANDLER CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    console.log('=== RAW WEBHOOK BODY RECEIVED ===');
    console.log('Body length:', rawBody.length);
    console.log('Body preview:', rawBody.substring(0, 500) + '...');
    
    let webhookData: MailerSendWebhook;
    
    try {
      webhookData = JSON.parse(rawBody);
      console.log('=== PARSED WEBHOOK DATA ===');
      console.log('Webhook type:', webhookData.type);
      console.log('Webhook keys:', Object.keys(webhookData));
      console.log('Data keys:', webhookData.data ? Object.keys(webhookData.data) : 'No data');
    } catch (parseError) {
      console.error('=== JSON PARSE ERROR ===');
      console.error('Parse error:', parseError);
      console.log('Raw body that failed to parse (first 1000 chars):', rawBody.substring(0, 1000));
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON payload',
          debug: { rawBodyPreview: rawBody.substring(0, 200) }
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if this is an inbound message webhook
    if (webhookData.type !== 'inbound.message' || !webhookData.data) {
      console.log('=== NOT AN INBOUND MESSAGE ===');
      console.log('Webhook type:', webhookData.type);
      console.log('Has data:', !!webhookData.data);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Webhook received but not an inbound message (type: ${webhookData.type})`,
          debug: { type: webhookData.type, hasData: !!webhookData.data }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('=== PROCESSING INBOUND MESSAGE ===');
    console.log('From email:', webhookData.data.from.email);
    console.log('From name:', webhookData.data.from.name);
    console.log('To emails:', webhookData.data.recipients.to.data.map(r => r.email));
    console.log('Subject:', webhookData.data.subject);
    console.log('Message ID:', webhookData.data.id);
    console.log('Headers:', Object.keys(webhookData.data.headers || {}));

    // Extract email data from MailerSend's nested structure
    const emailData: IncomingEmail = {
      from: webhookData.data.from.email,
      to: webhookData.data.recipients.to.data[0]?.email || webhookData.data.recipients.rcptTo[0]?.email,
      subject: webhookData.data.subject,
      text: webhookData.data.text || '',
      html: webhookData.data.html || '',
      message_id: webhookData.data.headers?.['Message-ID'] || webhookData.data.id,
      in_reply_to: webhookData.data.headers?.['In-Reply-To'],
      references: webhookData.data.headers?.['References']
    };

    console.log('=== EXTRACTED EMAIL DATA ===');
    console.log('From:', emailData.from);
    console.log('To:', emailData.to);
    console.log('Subject:', emailData.subject);
    console.log('Message ID:', emailData.message_id);
    console.log('Text length:', emailData.text?.length || 0);
    console.log('HTML length:', emailData.html?.length || 0);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ENHANCED duplicate detection - check by external_message_id first
    console.log('=== DUPLICATE DETECTION ===');
    if (emailData.message_id) {
      console.log('Checking for duplicates by message ID:', emailData.message_id);
      const { data: existingByMessageId, error: messageIdError } = await supabase
        .from('email_messages')
        .select('id, sender_email, subject, created_at')
        .eq('external_message_id', emailData.message_id)
        .maybeSingle();

      if (messageIdError) {
        console.error('Error checking for duplicates by message_id:', messageIdError);
      }

      if (existingByMessageId) {
        console.log('=== DUPLICATE DETECTED BY MESSAGE ID ===');
        console.log('Existing message:', existingByMessageId);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Duplicate message ignored (by external_message_id)',
            message_id: emailData.message_id,
            debug: { existingMessageId: existingByMessageId.id }
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Secondary duplicate check by sender, subject, and time window
    console.log('Performing secondary duplicate check...');
    const { data: existingMessage, error: duplicateCheckError } = await supabase
      .from('email_messages')
      .select('id, sender_email, subject, created_at')
      .eq('sender_email', emailData.from)
      .eq('subject', emailData.subject)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Within last 5 minutes
      .maybeSingle();

    if (duplicateCheckError) {
      console.error('Error in secondary duplicate check:', duplicateCheckError);
    }

    if (existingMessage) {
      console.log('=== DUPLICATE DETECTED BY SENDER/SUBJECT/TIME ===');
      console.log('Existing message:', existingMessage);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Duplicate message ignored (by sender/subject/time)',
          message_id: emailData.message_id,
          debug: { existingMessageId: existingMessage.id, timeWindow: '5 minutes' }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Find user by their unique email address
    console.log('=== USER LOOKUP ===');
    console.log('Looking up user by unique email:', emailData.to);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id: id, full_name, unique_email')
      .eq('unique_email', emailData.to)
      .maybeSingle();

    if (profileError || !profileData) {
      console.error('=== USER NOT FOUND ===');
      console.error('Profile error:', profileError);
      console.log('Email address searched:', emailData.to);
      
      // Log all unique emails for debugging
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('unique_email')
        .limit(10);
      console.log('Available unique emails (sample):', allProfiles?.map(p => p.unique_email));
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `No user found for email address: ${emailData.to}`,
          debug: { 
            searchedEmail: emailData.to,
            profileError: profileError?.message,
            availableEmailsSample: allProfiles?.map(p => p.unique_email).slice(0, 5)
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userId = profileData.id;
    console.log('=== USER FOUND ===');
    console.log('User ID:', userId);
    console.log('User name:', profileData.full_name);

    let threadId: string | null = null;
    
    // ENHANCED THREAD MATCHING - Try multiple strategies
    console.log('=== ENHANCED THREAD MATCHING ===');
    
    // Strategy 1: Extract thread ID from subject
    const threadMatch = emailData.subject.match(/\[Thread:([^\]]+)\]/);
    if (threadMatch) {
      threadId = threadMatch[1];
      console.log('=== THREAD ID FOUND IN SUBJECT ===');
      console.log('Extracted thread ID:', threadId);
      
      // Verify the thread belongs to this user
      const { data: threadData, error: threadError } = await supabase
        .from('email_threads')
        .select('user_id, application_id, job_id, subject')
        .eq('id', threadId)
        .eq('user_id', userId)
        .maybeSingle();

      if (threadError || !threadData) {
        console.error('=== THREAD VERIFICATION FAILED ===');
        console.error('Thread error:', threadError);
        console.log('Thread ID:', threadId);
        console.log('User ID:', userId);
        threadId = null;
      } else {
        console.log('=== THREAD VERIFIED ===');
        console.log('Thread data:', threadData);
      }
    }

    // Strategy 2: If no thread ID found, look for candidate-specific threads
    if (!threadId) {
      console.log('=== SEARCHING BY APPLICATION ===');
      console.log('Searching for application by sender email:', emailData.from);
      
      // Look for application record by sender email
      const { data: applicationData, error: appError } = await supabase
        .from('applications')
        .select('id, job_id, name, jobs!inner(user_id, title)')
        .eq('email', emailData.from)
        .eq('jobs.user_id', userId)
        .maybeSingle();

      if (applicationData) {
        console.log('=== APPLICATION FOUND ===');
        console.log('Application:', applicationData);
        
        // Look for thread with this application_id
        const { data: appThread, error: appThreadError } = await supabase
          .from('email_threads')
          .select('id, subject, participants, application_id')
          .eq('user_id', userId)
          .eq('application_id', applicationData.id)
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (appThread) {
          threadId = appThread.id;
          console.log('=== THREAD FOUND BY APPLICATION ===');
          console.log('Thread:', appThread);
        } else {
          console.log('=== NO THREAD FOR APPLICATION ===');
          console.log('Application ID:', applicationData.id);
        }
      } else {
        console.log('=== NO APPLICATION FOUND ===');
        console.log('Sender email:', emailData.from);
        console.log('Application error:', appError);
      }
    }

    // Strategy 3: If still no thread found, try to find existing thread by subject and participants
    if (!threadId) {
      console.log('=== SEARCHING BY SUBJECT AND PARTICIPANTS ===');
      const normalizedSubject = emailData.subject
        .replace(/^(Re:|RE:|Fwd:|FWD:)\s*/gi, '')
        .replace(/\[Thread:[^\]]+\]/g, '')
        .trim();

      console.log('Normalized subject:', normalizedSubject);

      const { data: existingThreads, error: searchError } = await supabase
        .from('email_threads')
        .select('id, user_id, participants, application_id, subject')
        .eq('user_id', userId)
        .ilike('subject', `%${normalizedSubject}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (searchError) {
        console.error('Error searching for threads:', searchError);
      } else if (existingThreads && existingThreads.length > 0) {
        console.log(`=== FOUND ${existingThreads.length} POTENTIAL THREADS ===`);
        
        for (const thread of existingThreads) {
          const participants = Array.isArray(thread.participants) 
            ? thread.participants 
            : [];
          
          console.log('Checking thread:', {
            id: thread.id,
            subject: thread.subject,
            participants: participants,
            applicationId: thread.application_id,
            senderEmail: emailData.from
          });
          
          if (participants.some(p => typeof p === 'string' && p.toLowerCase() === emailData.from.toLowerCase())) {
            threadId = thread.id;
            console.log('=== THREAD FOUND BY PARTICIPANTS ===');
            console.log('Selected thread:', thread.id);
            break;
          }
        }
        
        if (!threadId) {
          console.log('=== NO MATCHING PARTICIPANTS FOUND ===');
        }
      } else {
        console.log('=== NO THREADS FOUND BY SUBJECT ===');
      }
    }

    // If still no thread found, create a new one
    if (!threadId) {
      console.log('=== CREATING NEW THREAD ===');
      
      // Check if this is from a known candidate
      const { data: candidateApp, error: candidateError } = await supabase
        .from('applications')
        .select('id, job_id, name, jobs!inner(user_id, title)')
        .eq('email', emailData.from)
        .eq('jobs.user_id', userId)
        .maybeSingle();

      const threadData: any = {
        user_id: userId,
        subject: emailData.subject,
        participants: [emailData.from, emailData.to],
        reply_to_email: emailData.to,
        last_message_at: new Date().toISOString(),
        unread_count: 1,
        status: 'active'
      };

      // If this is from a known candidate, link to application
      if (candidateApp) {
        threadData.application_id = candidateApp.id;
        threadData.job_id = candidateApp.job_id;
        console.log('=== LINKING TO CANDIDATE APPLICATION ===');
        console.log('Application:', candidateApp);
      }
      
      console.log('Creating thread with data:', threadData);
      
      const { data: newThread, error: createError } = await supabase
        .from('email_threads')
        .insert(threadData)
        .select('id')
        .single();

      if (createError) {
        console.error('=== THREAD CREATION FAILED ===');
        console.error('Create error:', createError);
        throw createError;
      }

      threadId = newThread.id;
      console.log('=== NEW THREAD CREATED ===');
      console.log('Thread ID:', threadId);
    }

    if (!threadId) {
      console.error('=== CRITICAL ERROR: NO THREAD ID ===');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Could not determine thread for incoming email',
          debug: {
            subject: emailData.subject,
            from: emailData.from,
            to: emailData.to,
            userId: userId
          }
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Clean the email content before storing
    const cleanedContent = cleanEmailContent(emailData.text || emailData.html || '');
    console.log('=== CONTENT CLEANING ===');
    console.log('Original length:', (emailData.text || emailData.html || '').length);
    console.log('Cleaned length:', cleanedContent.length);
    console.log('Cleaned preview:', cleanedContent.substring(0, 200));

    // Insert the new message with is_read: false for inbound messages
    console.log('=== INSERTING MESSAGE ===');
    const messageData = {
      thread_id: threadId,
      sender_email: emailData.from,
      recipient_email: emailData.to,
      subject: emailData.subject,
      content: cleanedContent,
      direction: 'inbound',
      message_type: 'reply',
      is_read: false, // CRITICAL: Mark as unread for inbound messages
      external_message_id: emailData.message_id || null
    };
    
    console.log('Message data:', messageData);
    
    const { error: messageError } = await supabase
      .from('email_messages')
      .insert(messageData);

    if (messageError) {
      console.error('=== MESSAGE INSERT FAILED ===');
      console.error('Message error:', messageError);
      throw messageError;
    }

    console.log('=== MESSAGE INSERTED SUCCESSFULLY ===');

    // Update thread with proper unread count increment
    console.log('=== UPDATING THREAD ===');
    
    // Get the current unread count and increment it
    const { data: currentThread, error: getCurrentError } = await supabase
      .from('email_threads')
      .select('unread_count')
      .eq('id', threadId)
      .single();

    if (getCurrentError) {
      console.error('Failed to get current thread:', getCurrentError);
      throw getCurrentError;
    }

    const newUnreadCount = (currentThread?.unread_count || 0) + 1;
    console.log('Updating unread count:', {
      current: currentThread?.unread_count,
      new: newUnreadCount
    });

    // Update with the new unread count
    const { error: updateError } = await supabase
      .from('email_threads')
      .update({
        last_message_at: new Date().toISOString(),
        unread_count: newUnreadCount
      })
      .eq('id', threadId);

    if (updateError) {
      console.error('=== THREAD UPDATE FAILED ===');
      console.error('Update error:', updateError);
      throw updateError;
    } else {
      console.log('=== THREAD UPDATED SUCCESSFULLY ===');
      console.log('New unread count:', newUnreadCount);
    }

    console.log('=== EMAIL PROCESSING COMPLETED ===');
    console.log('Thread ID:', threadId);
    console.log('Unread count:', newUnreadCount);

    return new Response(
      JSON.stringify({ 
        success: true, 
        thread_id: threadId,
        unread_count: newUnreadCount,
        message: 'Email processed successfully and marked as UNREAD',
        debug: {
          messageId: emailData.message_id,
          cleanedContentLength: cleanedContent.length,
          threadCreated: false // We'll track this better later
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("=== CRITICAL ERROR IN EMAIL WEBHOOK ===");
    console.error("Error:", error);
    console.error("Stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
