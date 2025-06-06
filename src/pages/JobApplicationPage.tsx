
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JobApplication } from "@/components/JobApplication";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  role_type: string;
  experience_level: string;
  required_skills: string;
  budget: string;
  duration: string;
  status: string;
  created_at: string;
}

export const JobApplicationPage = () => {
  const { jobId } = useParams<{ jobId: string }>();

  // Fetch job details
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['public-job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('No job ID provided');
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('status', 'active')
        .single();
      
      if (error) throw error;
      return data as Job;
    },
    enabled: !!jobId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
            <p className="text-gray-600">
              This job posting is no longer available or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <JobApplication job={job} />
    </div>
  );
};
