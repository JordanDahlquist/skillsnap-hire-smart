import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Users, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CreateRoleModal } from "@/components/CreateRoleModal";
import { EnhancedJobCard } from "@/components/EnhancedJobCard";
import { JobManagementToolbar } from "@/components/JobManagementToolbar";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";
import { getWelcomeMessage, getWelcomeSubtitle } from "@/utils/welcomeMessages";

type JobRow = Database['public']['Tables']['jobs']['Row'];

interface Job extends JobRow {
  applications?: { count: number }[];
}

const MyJobs = () => {
  const { user, profile } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [workTypeFilter, setWorkTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_desc");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const { toast } = useToast();

  // Get user's display name (first name only)
  const getUserDisplayName = () => {
    if (profile?.full_name) {
      // Extract first name from full name
      return profile.full_name.split(' ')[0];
    }
    // Fallback to email username
    return user?.email?.split('@')[0] || 'there';
  };

  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ['user-jobs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          applications(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Job[];
    },
    enabled: !!user?.id,
  });

  // Fetch applications for this week calculation
  const { data: recentApplications = [] } = useQuery({
    queryKey: ['recent-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('applications')
        .select('created_at, job_id')
        .in('job_id', jobs.map(job => job.id))
        .gte('created_at', oneWeekAgo.toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && jobs.length > 0,
  });

  // Calculate quick stats
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalApplications = jobs.reduce((acc, job) => acc + (job.applications?.[0]?.count || 0), 0);
    const applicationsThisWeek = recentApplications.length;

    return { totalJobs, activeJobs, totalApplications, applicationsThisWeek };
  }, [jobs, recentApplications]);

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.role_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Apply work type filter
    if (workTypeFilter !== 'all') {
      filtered = filtered.filter(job => job.location_type === workTypeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'applications_desc':
          return (b.applications?.[0]?.count || 0) - (a.applications?.[0]?.count || 0);
        case 'applications_asc':
          return (a.applications?.[0]?.count || 0) - (b.applications?.[0]?.count || 0);
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, searchTerm, statusFilter, workTypeFilter, sortBy]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const handleJobSelection = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(filteredAndSortedJobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedJobs.length === 0) return;

    try {
      switch (action) {
        case 'activate':
        case 'pause':
        case 'archive':
          const status = action === 'activate' ? 'active' : action === 'pause' ? 'paused' : 'closed';
          const { error } = await supabase
            .from('jobs')
            .update({ status, updated_at: new Date().toISOString() })
            .in('id', selectedJobs);

          if (error) throw error;

          toast({
            title: "Bulk action completed",
            description: `${selectedJobs.length} job(s) ${action}d successfully`,
          });
          break;

        case 'export':
          // Simple CSV export
          const selectedJobsData = jobs.filter(job => selectedJobs.includes(job.id));
          const csvContent = [
            ['Title', 'Status', 'Applications', 'Created', 'Type', 'Experience', 'Location'].join(','),
            ...selectedJobsData.map(job => [
              job.title,
              job.status,
              job.applications?.[0]?.count || 0,
              new Date(job.created_at).toLocaleDateString(),
              job.role_type,
              job.experience_level,
              job.location_type || 'Not specified'
            ].join(','))
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'jobs-export.csv';
          a.click();
          window.URL.revokeObjectURL(url);

          toast({
            title: "Export completed",
            description: "Job data exported to CSV file",
          });
          break;
      }

      setSelectedJobs([]);
      refetch();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007af6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Dashboard", isCurrentPage: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Header */}
      <UnifiedHeader 
        breadcrumbs={breadcrumbs}
        onCreateRole={() => setIsCreateModalOpen(true)}
        showCreateButton={true}
      />

      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          {/* Main Header Content */}
          <div className="py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {getWelcomeMessage(getUserDisplayName())}
                </h1>
                <p className="text-lg text-gray-600">
                  {getWelcomeSubtitle()}
                </p>
              </div>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#007af6] hover:bg-[#0056b3] px-6 py-3 text-lg"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Job
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-[#007af6]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                      <p className="text-2xl font-bold text-[#007af6]">{stats.activeJobs}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-[#007af6]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Applications</p>
                      <p className="text-2xl font-bold text-[#007af6]">{stats.totalApplications}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#007af6]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Applications This Week</p>
                      <p className="text-2xl font-bold text-[#007af6]">{stats.applicationsThisWeek}</p>
                      {stats.applicationsThisWeek > 0 && (
                        <Badge className="mt-1 bg-blue-100 text-[#007af6]">
                          Applications this week
                        </Badge>
                      )}
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-[#007af6]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <JobManagementToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        workTypeFilter={workTypeFilter}
        onWorkTypeFilterChange={setWorkTypeFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalJobs={jobs.length}
        selectedJobs={selectedJobs}
        onBulkAction={handleBulkAction}
        onRefresh={refetch}
      />

      <div className="max-w-7xl mx-auto px-8 py-8">
        {filteredAndSortedJobs.length === 0 && jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No jobs yet</p>
              <p className="mb-4">Create your first job posting to start receiving applications</p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#007af6] hover:bg-[#0056b3]"
              >
                Create Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : filteredAndSortedJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium mb-2">No jobs match your filters</p>
              <p className="mb-4">Try adjusting your search or filter criteria</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setWorkTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Bulk selection header */}
            {filteredAndSortedJobs.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                <Checkbox
                  checked={selectedJobs.length === filteredAndSortedJobs.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  Select all {filteredAndSortedJobs.length} job(s)
                </span>
              </div>
            )}

            {/* Job cards */}
            <div className="space-y-6">
              {filteredAndSortedJobs.map((job) => (
                <div key={job.id} className="flex gap-4">
                  <div className="flex items-start pt-6">
                    <Checkbox
                      checked={selectedJobs.includes(job.id)}
                      onCheckedChange={(checked) => handleJobSelection(job.id, checked as boolean)}
                    />
                  </div>
                  <div className="flex-1">
                    <EnhancedJobCard
                      job={job}
                      onJobUpdate={refetch}
                      getTimeAgo={getTimeAgo}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateRoleModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </div>
  );
};

export default MyJobs;
