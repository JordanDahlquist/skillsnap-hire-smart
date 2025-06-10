
import { supabase } from "@/integrations/supabase/client";

export const updateExistingEmailThreads = async (userId: string): Promise<void> => {
  console.log('Updating existing email threads for user:', userId);
  
  try {
    // Update threads that have the old @atract.ai email in participants
    const { data: threads, error: fetchError } = await supabase
      .from('email_threads')
      .select('id, participants')
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

      // Update participants to use inbound subdomain
      const updatedParticipants = thread.participants.map(participant => {
        if (typeof participant === 'string' && participant.includes('@atract.ai')) {
          const [localPart] = participant.split('@');
          return `${localPart}@inbound.atract.ai`;
        }
        return participant;
      });

      // Only update if there were changes
      const hasChanges = JSON.stringify(thread.participants) !== JSON.stringify(updatedParticipants);
      
      if (hasChanges) {
        const { error: updateError } = await supabase
          .from('email_threads')
          .update({ participants: updatedParticipants })
          .eq('id', thread.id);

        if (updateError) {
          console.error(`Error updating thread ${thread.id}:`, updateError);
        } else {
          console.log(`Updated participants for thread ${thread.id}`);
        }
      }
    }

    console.log('Finished updating email threads');
  } catch (error) {
    console.error('Error in updateExistingEmailThreads:', error);
  }
};
