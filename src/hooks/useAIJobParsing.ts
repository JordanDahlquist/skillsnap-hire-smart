import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIJobData {
  companyName: string | null;
  jobTitle: string | null;
  location: string | null;
  experienceLevel: string | null;
  roleType: string | null;
  employmentType: string | null;
  industry: string | null;
  isExecutiveRole: boolean;
  salary: string | null;
  workLocation: string | null;
}

export const useAIJobParsing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const parseJobOverview = async (jobOverview: string): Promise<AIJobData | null> => {
    if (!jobOverview || jobOverview.trim().length < 10) {
      return null;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('parse-job-overview', {
        body: { jobOverview: jobOverview.trim() }
      });

      if (error) {
        console.error('Error calling parse-job-overview function:', error);
        return null;
      }

      if (data?.success && data?.data) {
        console.log('AI parsed job data:', data.data);
        return data.data;
      }

      return null;
    } catch (error) {
      console.error('Error parsing job overview with AI:', error);
      toast({
        title: "AI Parsing Error",
        description: "Failed to parse job overview with AI, using fallback method",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    parseJobOverview,
    isLoading
  };
};