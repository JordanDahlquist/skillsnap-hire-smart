
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardStats } from "./dashboard/DashboardStats";
import { ApplicationsList } from "./dashboard/ApplicationsList";
import { ApplicationDetail } from "./dashboard/ApplicationDetail";

interface Application {
  id: string;
  name: string;
  email: string;
  portfolio: string | null;
  created_at: string;
  ai_rating: number | null;
  ai_summary: string | null;
  status: string;
  experience: string | null;
  answer_1: string | null;
  answer_2: string | null;
  answer_3: string | null;
}

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

export const Dashboard = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Fetch job details
  const { data: job, isLoading: jobLoading, error: jobError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('No job ID provided');
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error) throw error;
      return data as Job;
    },
    enabled: !!jobId,
  });

  // Fetch applications for this job
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['applications', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Application[];
    },
    enabled: !!jobId,
  });

  // Set first application as selected when applications load
  useEffect(() => {
    if (applications.length > 0 && !selectedApplication) {
      setSelectedApplication(applications[0]);
    }
  }, [applications, selectedApplication]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRatingStars = (rating: number | null) => {
    const ratingValue = rating || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(ratingValue) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600">The job you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader job={job} getTimeAgo={getTimeAgo} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats applications={applications} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ApplicationsList 
              applications={applications}
              selectedApplication={selectedApplication}
              onSelectApplication={setSelectedApplication}
              getStatusColor={getStatusColor}
              getRatingStars={getRatingStars}
              getTimeAgo={getTimeAgo}
            />
          </div>

          <div className="lg:col-span-2">
            <ApplicationDetail 
              selectedApplication={selectedApplication}
              applications={applications}
              job={job}
              getStatusColor={getStatusColor}
              getRatingStars={getRatingStars}
              getTimeAgo={getTimeAgo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
