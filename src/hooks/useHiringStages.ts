
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface HiringStage {
  id: string;
  name: string;
  order_index: number;
  color: string;
  is_default: boolean;
}

// Helper function to determine appropriate status based on pipeline stage
const getStatusFromStage = (stageName: string, currentManualRating?: number | null): string => {
  const lowerStageName = stageName.toLowerCase();
  
  if (lowerStageName === 'rejected') {
    return 'rejected';
  }
  
  if (lowerStageName === 'hired') {
    return 'approved';
  }
  
  // For other stages, determine based on manual rating if available
  if (lowerStageName === 'applied') {
    return 'pending';
  }
  
  // For review/interview stages, check if they have been manually rated
  if (currentManualRating && currentManualRating > 0) {
    return 'reviewed';
  }
  
  return 'pending';
};

export const useHiringStages = (jobId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stages = [], isLoading, error } = useQuery({
    queryKey: ['hiring-stages', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('hiring_stages')
        .select('*')
        .eq('job_id', jobId)
        .order('order_index');
      
      if (error) throw error;
      return data as HiringStage[];
    },
    enabled: !!jobId,
  });

  const updateApplicationStage = useMutation({
    mutationFn: async ({ applicationId, stage }: { applicationId: string; stage: string }) => {
      // First, get the current application data to determine appropriate status
      const { data: currentApp, error: fetchError } = await supabase
        .from('applications')
        .select('manual_rating, status, rejection_reason')
        .eq('id', applicationId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Determine the new status based on the stage
      const newStatus = getStatusFromStage(stage, currentApp?.manual_rating);
      
      // Prepare update data
      const updateData: any = {
        pipeline_stage: stage,
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      // Clear rejection reason if moving away from rejected status
      if (currentApp?.status === 'rejected' && newStatus !== 'rejected') {
        updateData.rejection_reason = null;
      }
      
      console.log('Updating application stage and status:', {
        applicationId,
        stage,
        newStatus,
        clearingRejection: currentApp?.status === 'rejected' && newStatus !== 'rejected'
      });
      
      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId);
      
      if (error) throw error;
    },
    onSuccess: (_, { stage }) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Stage Updated",
        description: `Application moved to ${stage} stage with updated status`,
      });
    },
    onError: (error) => {
      console.error('Error updating application stage:', error);
      toast({
        title: "Error",
        description: "Failed to update application stage",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateStages = useMutation({
    mutationFn: async ({ applicationIds, stage }: { applicationIds: string[]; stage: string }) => {
      // Get current application data for all applications
      const { data: currentApps, error: fetchError } = await supabase
        .from('applications')
        .select('id, manual_rating, status')
        .in('id', applicationIds);
      
      if (fetchError) throw fetchError;
      
      // Update each application with appropriate status
      const updates = currentApps?.map(app => {
        const newStatus = getStatusFromStage(stage, app.manual_rating);
        return {
          id: app.id,
          pipeline_stage: stage,
          status: newStatus,
          // Clear rejection reason if moving away from rejected status
          rejection_reason: app.status === 'rejected' && newStatus !== 'rejected' ? null : undefined,
          updated_at: new Date().toISOString()
        };
      }) || [];
      
      // Perform bulk update
      for (const update of updates) {
        const { rejection_reason, ...updateData } = update;
        const finalUpdate = rejection_reason === null 
          ? { ...updateData, rejection_reason: null }
          : updateData;
          
        const { error } = await supabase
          .from('applications')
          .update(finalUpdate)
          .eq('id', update.id);
        
        if (error) throw error;
      }
    },
    onSuccess: (_, { applicationIds, stage }) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Stages Updated",
        description: `${applicationIds.length} applications moved to ${stage} stage with updated status`,
      });
    },
    onError: (error) => {
      console.error('Error bulk updating stages:', error);
      toast({
        title: "Error",
        description: "Failed to update application stages",
        variant: "destructive",
      });
    },
  });

  return {
    stages,
    isLoading,
    error,
    updateApplicationStage: updateApplicationStage.mutate,
    bulkUpdateStages: bulkUpdateStages.mutate,
    isUpdating: updateApplicationStage.isPending || bulkUpdateStages.isPending,
  };
};
