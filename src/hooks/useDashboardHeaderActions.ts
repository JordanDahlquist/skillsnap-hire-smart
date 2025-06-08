
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Job {
  id: string;
  title: string;
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

export const useDashboardHeaderActions = (
  job: Job, 
  applications: Application[], 
  onJobUpdate: () => void
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleEditJob = () => {
    setIsEditModalOpen(true);
  };

  const handleArchiveJob = async () => {
    await handleStatusChange('closed');
  };

  const handleUnarchiveJob = async () => {
    await handleStatusChange('active');
  };

  return {
    isUpdating,
    isEditModalOpen,
    setIsEditModalOpen,
    handleStatusChange,
    handleShareJob,
    handleExportApplications,
    handleEditJob,
    handleArchiveJob,
    handleUnarchiveJob
  };
};
