
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
      const { error } = await supabase
        .from('applications')
        .update({ 
          pipeline_stage: stage,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Stage Updated",
        description: "Application stage has been updated successfully",
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
      const { error } = await supabase
        .from('applications')
        .update({ 
          pipeline_stage: stage,
          updated_at: new Date().toISOString()
        })
        .in('id', applicationIds);
      
      if (error) throw error;
    },
    onSuccess: (_, { applicationIds, stage }) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Stages Updated",
        description: `${applicationIds.length} applications moved to ${stage} stage`,
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
