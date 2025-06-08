
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface JobFormData {
  title: string;
  description: string;
  required_skills: string;
  experience_level: string;
  role_type: string;
  employment_type: string;
  location_type: string;
  budget: string;
  duration: string;
  company_name?: string;
  country?: string;
  state?: string;
  city?: string;
  region?: string;
}

export const useJobCreation = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const createJob = async (jobData: JobFormData) => {
    if (!user) {
      throw new Error('User must be authenticated to create a job');
    }

    setLoading(true);
    
    try {
      // Use job-specific company name if provided, otherwise fall back to profile company name
      const finalCompanyName = jobData.company_name || profile?.company_name || 'Your Company';
      
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          company_name: finalCompanyName,
          user_id: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Job created successfully!",
        description: "Your job has been saved as a draft.",
      });

      return data;
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast({
        title: "Error creating job",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (jobId: string, jobData: Partial<JobFormData>) => {
    if (!user) {
      throw new Error('User must be authenticated to update a job');
    }

    setLoading(true);
    
    try {
      // If company_name is being updated but is empty, use profile company name
      if ('company_name' in jobData && !jobData.company_name) {
        jobData.company_name = profile?.company_name || 'Your Company';
      }
      
      const { data, error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', jobId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Job updated successfully!",
        description: "Your changes have been saved.",
      });

      return data;
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast({
        title: "Error updating job",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createJob,
    updateJob,
    loading,
  };
};
