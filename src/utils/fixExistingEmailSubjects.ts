
import { supabase } from "@/integrations/supabase/client";
import { processEmailSubject, hasTemplateVariables } from "./emailTemplateUtils";

export const fixExistingEmailSubjects = async (userId: string): Promise<void> => {
  console.log('Starting to fix existing email subjects for user:', userId);
  
  try {
    // Fetch all threads for the user that have template variables
    const { data: threads, error: fetchError } = await supabase
      .from('email_threads')
      .select('id, subject, application_id, job_id')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Error fetching threads:', fetchError);
      return;
    }

    if (!threads || threads.length === 0) {
      console.log('No threads found for user');
      return;
    }

    // Filter threads that have template variables
    const threadsToFix = threads.filter(thread => hasTemplateVariables(thread.subject));
    
    if (threadsToFix.length === 0) {
      console.log('No threads with template variables found');
      return;
    }

    console.log(`Found ${threadsToFix.length} threads to fix`);

    // Process each thread
    for (const thread of threadsToFix) {
      try {
        const processedSubject = await processEmailSubject(
          thread.subject,
          thread.application_id || undefined,
          thread.job_id || undefined
        );

        // Update the thread with the processed subject
        const { error: updateError } = await supabase
          .from('email_threads')
          .update({ subject: processedSubject })
          .eq('id', thread.id);

        if (updateError) {
          console.error(`Error updating thread ${thread.id}:`, updateError);
        } else {
          console.log(`Fixed subject for thread ${thread.id}: "${thread.subject}" -> "${processedSubject}"`);
        }
      } catch (error) {
        console.error(`Error processing thread ${thread.id}:`, error);
      }
    }

    console.log('Finished fixing email subjects');
  } catch (error) {
    console.error('Error in fixExistingEmailSubjects:', error);
  }
};
