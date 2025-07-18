
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const updateJobWithInterviewQuestions = async (jobId: string, questions: string) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        generated_interview_questions: questions,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select();

    if (error) throw error;

    toast.success('Job updated with interview questions');
    return data;
  } catch (error) {
    console.error('Error updating job with interview questions:', error);
    toast.error('Failed to update job with interview questions');
    throw error;
  }
};

export const fixBastionAgencyJob = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('update-bastion-job');
    
    if (error) throw error;
    
    console.log('Bastion Agency job update result:', data);
    toast.success('Bastion Agency CEO job has been updated with interview questions');
    return data;
  } catch (error) {
    console.error('Error fixing Bastion Agency job:', error);
    toast.error('Failed to update Bastion Agency job');
    throw error;
  }
};
