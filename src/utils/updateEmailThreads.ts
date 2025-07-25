
import { supabase } from "@/integrations/supabase/client";

export const updateExistingEmailThreads = async (userId: string): Promise<void> => {
  console.log('Updating existing email threads for user:', userId);
  
  try {
    // First get the user's current unique email to use as the new format
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('unique_email')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.unique_email) {
      console.error('Error fetching user profile or no unique email:', profileError);
      return;
    }

    const currentUniqueEmail = profile.unique_email;
    console.log('Current user unique email:', currentUniqueEmail);

    // Update threads that have old email formats in participants or reply_to_email
    const { data: threads, error: fetchError } = await supabase
      .from('email_threads')
      .select('id, participants, reply_to_email')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Error fetching threads:', fetchError);
      return;
    }

    if (!threads || threads.length === 0) {
      console.log('No threads found for user');
      return;
    }

    console.log(`Found ${threads.length} threads to check`);

    // Process each thread
    for (const thread of threads) {
      if (!Array.isArray(thread.participants)) continue;

      let hasParticipantChanges = false;
      let hasReplyToChanges = false;

      // Update participants to use the current unique email format
      const updatedParticipants = thread.participants.map(participant => {
        if (typeof participant === 'string' && participant.includes('@inbound.atract.ai') && participant !== currentUniqueEmail) {
          // Check if this is the user's old email by seeing if it's not an external email
          const isExternalEmail = !participant.includes('@inbound.atract.ai') || 
                                  participant.includes('@gmail.com') || 
                                  participant.includes('@yahoo.com') ||
                                  participant.includes('@outlook.com') ||
                                  participant.includes('@hotmail.com');
          
          if (!isExternalEmail) {
            hasParticipantChanges = true;
            return currentUniqueEmail;
          }
        }
        return participant;
      });

      // Update reply_to_email if it's outdated
      let updatedReplyToEmail = thread.reply_to_email;
      if (thread.reply_to_email && thread.reply_to_email.includes('@inbound.atract.ai') && thread.reply_to_email !== currentUniqueEmail) {
        updatedReplyToEmail = currentUniqueEmail;
        hasReplyToChanges = true;
      }

      // Only update if there were changes
      if (hasParticipantChanges || hasReplyToChanges) {
        const updateData: any = {};
        if (hasParticipantChanges) updateData.participants = updatedParticipants;
        if (hasReplyToChanges) updateData.reply_to_email = updatedReplyToEmail;

        const { error: updateError } = await supabase
          .from('email_threads')
          .update(updateData)
          .eq('id', thread.id);

        if (updateError) {
          console.error(`Error updating thread ${thread.id}:`, updateError);
        } else {
          console.log(`Updated thread ${thread.id}:`, {
            participants: hasParticipantChanges ? updatedParticipants : 'no change',
            reply_to_email: hasReplyToChanges ? updatedReplyToEmail : 'no change'
          });
        }
      }
    }

    console.log('Finished updating email threads');
  } catch (error) {
    console.error('Error in updateExistingEmailThreads:', error);
  }
};
