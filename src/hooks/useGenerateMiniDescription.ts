
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useGenerateMiniDescription = () => {
  const { toast } = useToast();

  const generateMiniDescription = async (job: {
    id: string;
    title: string;
    description: string;
    role_type: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-mini-description', {
        body: {
          jobId: job.id,
          title: job.title,
          description: job.description,
          roleType: job.role_type,
        }
      });

      if (error) {
        console.error('Error generating mini description:', error);
        toast({
          title: "Error",
          description: "Failed to generate job description",
          variant: "destructive",
        });
        return null;
      }

      if (data?.success) {
        return data.miniDescription;
      }

      return null;
    } catch (error) {
      console.error('Error calling generate-mini-description function:', error);
      toast({
        title: "Error",
        description: "Failed to generate job description",
        variant: "destructive",
      });
      return null;
    }
  };

  return { generateMiniDescription };
};
