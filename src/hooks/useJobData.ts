
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Job } from '@/types';

export const useJobData = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = async () => {
    if (!jobId) {
      setError('No job ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select(`
          *,
          applications(count)
        `)
        .eq('id', jobId)
        .single();
      
      if (fetchError) throw fetchError;
      
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      const errorMessage = 'Failed to load job details';
      setError(errorMessage);
      toast.error(errorMessage);
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

  return {
    job,
    jobId,
    loading,
    error,
    getLocationDisplay,
    getTimeAgo,
    refetch: fetchJob
  };
};
