
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HiringStagesNavProps, HiringStage } from "./hiring-stages/types";
import { HiringStagesLoadingSkeleton } from "./hiring-stages/HiringStagesLoadingSkeleton";
import { AllApplicationsCard } from "./hiring-stages/AllApplicationsCard";
import { StageCard } from "./hiring-stages/StageCard";
import { getStageCounts, getStageKey } from "./hiring-stages/utils";

export const HiringStagesNav = ({
  jobId,
  applications,
  selectedStage,
  onStageSelect
}: HiringStagesNavProps) => {
  const { data: stages = [], isLoading } = useQuery({
    queryKey: ['hiring-stages', jobId],
    queryFn: async () => {
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

  const stageCounts = getStageCounts(applications, stages);
  const totalApplications = applications.length;

  if (isLoading) {
    return <HiringStagesLoadingSkeleton />;
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-auto-fit gap-4" style={{ gridTemplateColumns: `repeat(${stages.length + 1}, minmax(200px, 1fr))` }}>
          
          {/* All Applications Card */}
          <AllApplicationsCard
            totalApplications={totalApplications}
            selectedStage={selectedStage}
            onStageSelect={onStageSelect}
          />

          {/* Stage Cards */}
          {stages.map((stage, index) => {
            const stageKey = getStageKey(stage.name);
            const count = stageCounts[stageKey] || 0;
            const isSelected = selectedStage === stageKey;
            const isNextStage = index < stages.length - 1;

            return (
              <StageCard
                key={stage.id}
                stage={stage}
                count={count}
                isSelected={isSelected}
                isNextStage={isNextStage}
                selectedStage={selectedStage}
                onStageSelect={onStageSelect}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
