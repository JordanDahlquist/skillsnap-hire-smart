
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { useViewTracking } from "@/hooks/useViewTracking";
import { JobApplicationHeader } from "./job-application/JobApplicationHeader";
import { JobDescription } from "./job-application/JobDescription";
import { ApplicationForm } from "./job-application/ApplicationForm";
import { JobApplicationLoading, JobNotFound } from "./job-application/LoadingStates";
import { Job } from "@/types";

export const JobApplication = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track job view when component mounts
  useViewTracking(jobId || '', !!jobId && !!job);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          applications(count)
        `)
        .eq('id', jobId)
        .single();
      
      if (error) throw error;
      
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const getLocationDisplay = () => {
    if (!job) return 'Not specified';
    const { location_type, country, state, region, city } = job;
    
    if (location_type === 'remote') {
      if (country) {
        return `Remote (${country})`;
      }
      return 'Remote';
    }
    
    if (country === 'United States' && state) {
      const parts = [city, state, region].filter(Boolean);
      return parts.join(', ');
    }
    
    if (country) {
      const parts = [city, country].filter(Boolean);
      return parts.join(', ');
    }
    
    return location_type ? location_type.charAt(0).toUpperCase() + location_type.slice(1) : 'Not specified';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return <JobApplicationLoading />;
  }

  if (!job) {
    return <JobNotFound />;
  }

  const applicationsCount = job?.applications?.[0]?.count || 0;
  const isApplicationOpen = job.status === 'active';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Job Header */}
        <Card className="mb-8">
          <CardHeader>
            <JobApplicationHeader
              job={job}
              applicationsCount={applicationsCount}
              getLocationDisplay={getLocationDisplay}
              getTimeAgo={getTimeAgo}
            />
          </CardHeader>
          
          <CardContent>
            <JobDescription job={job} />
          </CardContent>
        </Card>

        {/* Application Form */}
        <ApplicationForm 
          job={job}
          jobId={jobId!} 
          isApplicationOpen={isApplicationOpen}
          jobStatus={job.status}
        />
      </div>
    </div>
  );
};
