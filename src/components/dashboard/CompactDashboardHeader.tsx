
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDropdown } from "@/components/ui/status-dropdown";
import { 
  ExternalLink, 
  ArrowLeft, 
  Share2, 
  MoreHorizontal,
  Eye
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

interface CompactDashboardHeaderProps {
  job: Job;
  applications: Application[];
  getTimeAgo: (dateString: string) => string;
  onJobUpdate: () => void;
}

export const CompactDashboardHeader = ({ 
  job, 
  applications, 
  getTimeAgo, 
  onJobUpdate 
}: CompactDashboardHeaderProps) => {
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

  // Calculate days running
  const startDate = new Date(job.created_at);
  const today = new Date();
  const daysRunning = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Format start date
  const startDateFormatted = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: startDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/jobs">
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900">{job.title}</h1>
                <Badge className={job.status === 'active' ? "bg-blue-100 text-blue-800" : job.status === 'paused' ? "bg-gray-100 text-gray-800" : job.status === 'closed' ? "bg-gray-100 text-gray-600" : "bg-gray-100 text-gray-800"}>
                  {job.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                <span>Posted {getTimeAgo(job.created_at)}</span>
                <span>•</span>
                <span>Started {startDateFormatted}</span>
                <span>•</span>
                <span>{daysRunning} day{daysRunning !== 1 ? 's' : ''} running</span>
                <span>•</span>
                <span>{applications.length} applications</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-gray-400" />
                  <span>342 views</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <StatusDropdown
              currentStatus={job.status}
              onStatusChange={handleStatusChange}
              disabled={isUpdating}
            />

            <Button variant="outline" size="sm" onClick={handleShareJob}>
              <Share2 className="w-4 h-4 text-gray-600" />
            </Button>

            <Button variant="outline" size="sm" asChild>
              <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </a>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Job</DropdownMenuItem>
                <DropdownMenuItem>Export Data</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Archive Job</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
