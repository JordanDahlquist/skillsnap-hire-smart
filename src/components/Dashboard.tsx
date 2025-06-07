
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedHeader } from "./UnifiedHeader";
import { CompactDashboardHeader } from "./dashboard/CompactDashboardHeader";
import { CompactDashboardStats } from "./dashboard/CompactDashboardStats";
import { ApplicationTrendsChart } from "./dashboard/ApplicationTrendsChart";
import { PerformanceMetrics } from "./dashboard/PerformanceMetrics";
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
  manual_rating: number | null;
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

  // Fetch job details with error handling
  const { data: job, isLoading: jobLoading, error: jobError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('No job ID provided');
      
      console.log('Fetching job details for ID:', jobId);
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();
      
      if (error) {
        console.error('Job fetch error:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No job found with ID:', jobId);
        throw new Error('Job not found');
      }
      
      return data as Job;
    },
    enabled: !!jobId,
    retry: 1,
  });

  // Fetch applications for this job with error handling
  const { data: applications = [], isLoading: applicationsLoading, error: applicationsError, refetch: refetchApplications } = useQuery({
    queryKey: ['applications', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      console.log('Fetching applications for job ID:', jobId);
      
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Applications fetch error:', error);
        throw error;
      }
      
      console.log('Applications fetched:', data?.length || 0);
      return data as Application[];
    },
    enabled: !!jobId,
    retry: 1,
  });

  // Set first application as selected when applications load
  useEffect(() => {
    if (applications.length > 0 && !selectedApplication) {
      setSelectedApplication(applications[0]);
    }
  }, [applications, selectedApplication]);

  // Update selected application when applications refetch
  useEffect(() => {
    if (selectedApplication && applications.length > 0) {
      const updatedApplication = applications.find(app => app.id === selectedApplication.id);
      if (updatedApplication) {
        setSelectedApplication(updatedApplication);
      }
    }
  }, [applications, selectedApplication]);

  // Helper functions
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

  const handleApplicationUpdate = () => {
    refetchApplications();
  };

  // Loading state
  if (jobLoading || applicationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (jobError || applicationsError) {
    console.error('Dashboard errors:', { jobError, applicationsError });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">
            {jobError ? 'Failed to load job details.' : 'Failed to load applications.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600">The job you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Dashboard", href: "/jobs" },
    { label: job.title, isCurrentPage: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader breadcrumbs={breadcrumbs} showCreateButton={false} />
      
      <CompactDashboardHeader 
        job={job} 
        applications={applications}
        getTimeAgo={getTimeAgo}
        onJobUpdate={() => {
          window.location.reload();
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Analytics Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApplicationTrendsChart applications={applications} />
            <PerformanceMetrics applications={applications} job={job} />
          </div>

          {/* Applications Management Section */}
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
                onApplicationUpdate={handleApplicationUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
