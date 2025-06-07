
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDropdown } from "@/components/ui/status-dropdown";
import { 
  ExternalLink, 
  ArrowLeft, 
  Pencil, 
  Share2, 
  Download, 
  MoreHorizontal,
  BarChart3,
  Archive,
  ArchiveRestore,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Job {
  id: string;
  title: string;
  created_at: string;
  status: string;
}

interface Application {
  id: string;
  name: string;
  email: string;
  created_at: string;
  ai_rating: number | null;
  status: string;
}

interface EnhancedDashboardHeaderProps {
  job: Job;
  applications: Application[];
  getTimeAgo: (dateString: string) => string;
  onJobUpdate: () => void;
}

export const EnhancedDashboardHeader = ({ 
  job, 
  applications, 
  getTimeAgo, 
  onJobUpdate 
}: EnhancedDashboardHeaderProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', job.id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Job is now ${newStatus}`,
      });
      
      onJobUpdate();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShareJob = async () => {
    const jobUrl = `${window.location.origin}/apply/${job.id}`;
    try {
      await navigator.clipboard.writeText(jobUrl);
      toast({
        title: "Link copied!",
        description: "Job application link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleExportApplications = () => {
    if (applications.length === 0) {
      toast({
        title: "No data to export",
        description: "This job has no applications yet",
      });
      return;
    }

    const csvContent = [
      ['Name', 'Email', 'Applied Date', 'AI Rating', 'Status'].join(','),
      ...applications.map(app => [
        app.name,
        app.email,
        new Date(app.created_at).toLocaleDateString(),
        app.ai_rating || 'N/A',
        app.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.title.replace(/[^a-zA-Z0-9]/g, '_')}_applications.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: "Applications data exported to CSV file",
    });
  };

  const handleArchiveJob = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'closed', updated_at: new Date().toISOString() })
        .eq('id', job.id);

      if (error) throw error;

      toast({
        title: "Job archived",
        description: "Job has been archived successfully",
      });
      
      onJobUpdate();
    } catch (error) {
      console.error('Error archiving job:', error);
      toast({
        title: "Error",
        description: "Failed to archive job",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnarchiveJob = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', job.id);

      if (error) throw error;

      toast({
        title: "Job unarchived",
        description: "Job has been unarchived and is now active",
      });
      
      onJobUpdate();
    } catch (error) {
      console.error('Error unarchiving job:', error);
      toast({
        title: "Error",
        description: "Failed to unarchive job",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getPerformanceIndicator = () => {
    if (applications.length === 0) return { text: "New", color: "bg-gray-100 text-gray-800" };
    if (applications.length >= 20) return { text: "High Interest", color: "bg-green-100 text-green-800" };
    if (applications.length >= 10) return { text: "Good Traction", color: "bg-blue-100 text-blue-800" };
    return { text: "Building Interest", color: "bg-yellow-100 text-yellow-800" };
  };

  const performanceIndicator = getPerformanceIndicator();

  const isArchived = job.status === 'closed';

  return (
    <>
      {/* Loading overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Updating job status...</span>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/jobs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Jobs
              </Link>
            </Button>
            <nav className="text-sm text-gray-500">
              <Link to="/" className="hover:text-gray-700">Home</Link>
              <span className="mx-2">•</span>
              <Link to="/jobs" className="hover:text-gray-700">My Jobs</Link>
              <span className="mx-2">•</span>
              <span className="text-gray-900">{job.title}</span>
            </nav>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <Badge className={performanceIndicator.color}>
                  {performanceIndicator.text}
                </Badge>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>Job posted {getTimeAgo(job.created_at)}</span>
                <span>•</span>
                <span>{applications.length} applications received</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>342 views</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status Dropdown */}
              <StatusDropdown
                currentStatus={job.status}
                onStatusChange={handleStatusChange}
                disabled={isUpdating}
              />

              {/* Main Action Buttons */}
              <Button variant="outline" size="sm" onClick={handleShareJob} disabled={isUpdating}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              <Button variant="outline" size="sm" asChild disabled={isUpdating}>
                <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public
                </a>
              </Button>

              {/* More Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isUpdating}>
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="w-4 h-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Job Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportApplications}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Applications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isArchived ? (
                    <DropdownMenuItem onClick={handleUnarchiveJob}>
                      <ArchiveRestore className="w-4 h-4 mr-2" />
                      Unarchive Job
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={handleArchiveJob} className="text-red-600">
                      <Archive className="w-4 h-4 mr-2" />
                      Archive Job
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Job Status Badge */}
              <Badge className={job.status === 'active' ? "bg-blue-100 text-blue-800" : job.status === 'paused' ? "bg-yellow-100 text-yellow-800" : job.status === 'closed' ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                {job.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
