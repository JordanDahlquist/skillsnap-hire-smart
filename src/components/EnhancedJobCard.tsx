import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusDropdown } from "@/components/ui/status-dropdown";
import { 
  Users, 
  ExternalLink, 
  BarChart3, 
  Copy, 
  Archive, 
  Trash2, 
  Clock, 
  TrendingUp,
  Eye,
  Calendar,
  MapPin,
  Pencil
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { EditJobModal } from "./EditJobModal";
import { Database } from "@/integrations/supabase/types";

type JobRow = Database['public']['Tables']['jobs']['Row'];

interface Job extends JobRow {
  applications?: { count: number }[];
}

interface EnhancedJobCardProps {
  job: Job;
  onJobUpdate: () => void;
  getTimeAgo: (dateString: string) => string;
}

export const EnhancedJobCard = ({ job, onJobUpdate, getTimeAgo }: EnhancedJobCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      case "closed": return "bg-red-100 text-red-800";
      case "draft": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLocationDisplay = () => {
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

  const handleDuplicateJob = async () => {
    try {
      const { data: originalJob } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', job.id)
        .single();

      if (!originalJob) throw new Error('Job not found');

      const { 
        title, description, role_type, experience_level, budget, required_skills, duration, user_id,
        location_type, country, state, region, city 
      } = originalJob;
      
      const { error } = await supabase
        .from('jobs')
        .insert({
          title: `${title} (Copy)`,
          description,
          role_type,
          experience_level,
          budget,
          required_skills,
          duration,
          user_id,
          location_type,
          country,
          state,
          region,
          city,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Job duplicated",
        description: "A copy of the job has been created as a draft",
      });
      
      onJobUpdate();
    } catch (error) {
      console.error('Error duplicating job:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate job",
        variant: "destructive",
      });
    }
  };

  const handleArchiveJob = async () => {
    await handleStatusChange('closed');
  };

  const applicationsCount = job.applications?.[0]?.count || 0;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-xl">
                  <Link 
                    to={`/dashboard/${job.id}`}
                    className="hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    {job.title}
                  </Link>
                </CardTitle>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span>{job.role_type} • {job.experience_level}</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{getLocationDisplay()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>42 views</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>12% response rate</span>
                </div>
                {job.budget && (
                  <div className="flex items-center gap-1 text-green-600">
                    <span className="font-medium">{job.budget}</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 line-clamp-2 mb-3">{job.description}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-blue-600">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{applicationsCount} applications</span>
                  {applicationsCount > 0 && (
                    <span className="text-gray-500">
                      (+{Math.floor(Math.random() * 5) + 1} this week)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Created {getTimeAgo(job.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
                <StatusDropdown
                  currentStatus={job.status}
                  onStatusChange={handleStatusChange}
                  disabled={isUpdating}
                  size="sm"
                />
              </div>
              {applicationsCount > 10 && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  High Interest
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDuplicateJob}
              >
                <Copy className="w-4 h-4 mr-1" />
                Duplicate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleArchiveJob}
              >
                <Archive className="w-4 h-4 mr-1" />
                Archive
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public
                </a>
              </Button>
              <Button size="sm" asChild className="bg-purple-600 hover:bg-purple-700">
                <Link to={`/dashboard/${job.id}`}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditJobModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        job={job}
        onJobUpdate={onJobUpdate}
      />
    </>
  );
};
