
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
  Loader2,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardHeaderActions } from "@/hooks/useDashboardHeaderActions";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Job, Application } from "@/types";

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
  const {
    isUpdating,
    isRefreshingAI,
    handleStatusChange,
    handleShareJob,
    handleExportApplications,
    handleArchiveJob,
    handleUnarchiveJob,
    handleRefreshAI
  } = useDashboardHeaderActions(job, applications, onJobUpdate);

  const getPerformanceIndicator = () => {
    if (applications.length === 0) return { text: "New", color: "bg-gray-100 text-gray-800" };
    if (applications.length >= 20) return { text: "High Interest", color: "bg-green-100 text-green-800" };
    if (applications.length >= 10) return { text: "Good Traction", color: "bg-blue-100 text-blue-800" };
    return { text: "Building Interest", color: "bg-yellow-100 text-yellow-800" };
  };

  // Determine the loading message based on the operation
  const getLoadingMessage = () => {
    if (isRefreshingAI) return "Updating job rankings...";
    if (isUpdating) return "Updating job status...";
    return "Loading...";
  };

  const performanceIndicator = getPerformanceIndicator();
  const isArchived = job.status === 'closed';

  return (
    <>
      {/* Loading overlay */}
      {(isUpdating || isRefreshingAI) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{getLoadingMessage()}</span>
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
                  <span>{job.view_count || 0} views</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status Dropdown */}
              <StatusDropdown
                currentStatus={job.status}
                onStatusChange={handleStatusChange}
                disabled={isUpdating || isRefreshingAI}
              />

              {/* AI Refresh Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshAI}
                disabled={isUpdating || isRefreshingAI || applications.length === 0}
                title="Refresh AI rankings for all applications"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingAI ? 'animate-spin' : ''}`} />
                Refresh AI
              </Button>

              {/* Main Action Buttons */}
              <Button variant="outline" size="sm" onClick={handleShareJob} disabled={isUpdating || isRefreshingAI}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              <Button variant="outline" size="sm" asChild disabled={isUpdating || isRefreshingAI}>
                <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public
                </a>
              </Button>

              {/* More Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isUpdating || isRefreshingAI}>
                    {(isUpdating || isRefreshingAI) ? (
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
