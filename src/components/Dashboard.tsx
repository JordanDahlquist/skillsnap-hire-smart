
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Star, Clock, Eye, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

  // Calculate stats
  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const approvedCount = applications.filter(app => app.status === 'approved').length;
  const avgRating = applications.length > 0 
    ? applications.reduce((sum, app) => sum + (app.ai_rating || 0), 0) / applications.length 
    : 0;

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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-600">Job posted {getTimeAgo(job.created_at)}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public Page
                </a>
              </Button>
              <Badge className={job.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {job.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ThumbsUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {applications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No applications yet</p>
                    <p className="text-sm">Applications will appear here when candidates apply</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                          selectedApplication?.id === app.id ? "bg-purple-50 border-l-4 border-l-purple-600" : ""
                        }`}
                        onClick={() => setSelectedApplication(app)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{app.name}</h3>
                          <Badge className={getStatusColor(app.status)}>
                            {app.status}
                          </Badge>
                        </div>
                        {app.ai_rating && (
                          <div className="flex items-center gap-1 mb-1">
                            {getRatingStars(app.ai_rating)}
                            <span className="text-sm text-gray-600 ml-1">{app.ai_rating.toFixed(1)}/5</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-600">{getTimeAgo(app.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Detail */}
          <div className="lg:col-span-2">
            {selectedApplication ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedApplication.name}</CardTitle>
                      <p className="text-gray-600">{selectedApplication.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="summary">AI Summary</TabsTrigger>
                      <TabsTrigger value="answers">Test Answers</TabsTrigger>
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        {selectedApplication.ai_rating && (
                          <div className="flex items-center gap-1">
                            {getRatingStars(selectedApplication.ai_rating)}
                            <span className="text-lg font-semibold ml-2">{selectedApplication.ai_rating.toFixed(1)}/5</span>
                          </div>
                        )}
                        <Badge className={getStatusColor(selectedApplication.status)}>
                          {selectedApplication.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">AI Assessment Summary</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedApplication.ai_summary || "AI analysis is being processed..."}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="answers" className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Answer 1</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {selectedApplication.answer_1 || "No answer provided"}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Answer 2</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {selectedApplication.answer_2 || "No answer provided"}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Answer 3</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {selectedApplication.answer_3 || "No answer provided"}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="profile" className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                        <p className="text-gray-700">{selectedApplication.email}</p>
                      </div>
                      
                      {selectedApplication.portfolio && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Portfolio</h4>
                          <a 
                            href={selectedApplication.portfolio} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 underline"
                          >
                            {selectedApplication.portfolio}
                          </a>
                        </div>
                      )}
                      
                      {selectedApplication.experience && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                          <p className="text-gray-700">{selectedApplication.experience}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Submitted</h4>
                        <p className="text-gray-700">{getTimeAgo(selectedApplication.created_at)}</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : applications.length > 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select an application to view details</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No Applications Yet</p>
                  <p>Share your job posting link to start receiving applications!</p>
                  <Button className="mt-4" variant="outline" asChild>
                    <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Job Application Page
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
