
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HiringStagesNavProps, HiringStage } from "./hiring-stages/types";
import { HiringStagesLoadingSkeleton } from "./hiring-stages/HiringStagesLoadingSkeleton";
import { AllApplicationsCard } from "./hiring-stages/AllApplicationsCard";
import { StageCard } from "./hiring-stages/StageCard";
import { RejectedStageCard } from "./hiring-stages/RejectedStageCard";
import { getStageCounts, getStageKey } from "./hiring-stages/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowRight } from "lucide-react";

export const HiringStagesNav = ({
  jobId,
  applications,
  selectedStage,
  onStageSelect
}: HiringStagesNavProps) => {
  const {
    data: stages = [],
    isLoading
  } = useQuery({
    queryKey: ['hiring-stages', jobId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('hiring_stages').select('*').eq('job_id', jobId).order('order_index');
      if (error) throw error;
      return data as HiringStage[];
    },
    enabled: !!jobId
  });
  
  const stageCounts = getStageCounts(applications, stages);
  const totalApplications = applications.length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;
  
  if (isLoading) {
    return <HiringStagesLoadingSkeleton />;
  }
  
  const renderStageWithArrow = (stageComponent: React.ReactNode, isLast: boolean) => (
    <div className="flex items-center gap-2">
      {stageComponent}
      {!isLast && (
        <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0 hidden md:block" />
      )}
    </div>
  );
  
  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
      <div className="p-3">
        {/* Mobile: Horizontal scroll */}
        <div className="block md:hidden">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              <AllApplicationsCard 
                totalApplications={totalApplications} 
                selectedStage={selectedStage} 
                onStageSelect={onStageSelect} 
              />

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

              <RejectedStageCard
                count={rejectedCount}
                isSelected={selectedStage === 'rejected'}
                onStageSelect={onStageSelect}
              />
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Tablet and Desktop: Grid layout with arrows */}
        <div className="hidden md:flex items-center gap-2">
          {renderStageWithArrow(
            <AllApplicationsCard 
              totalApplications={totalApplications} 
              selectedStage={selectedStage} 
              onStageSelect={onStageSelect} 
            />,
            false
          )}

          {stages.map((stage, index) => {
            const stageKey = getStageKey(stage.name);
            const count = stageCounts[stageKey] || 0;
            const isSelected = selectedStage === stageKey;
            const isLast = index === stages.length - 1;
            return renderStageWithArrow(
              <StageCard 
                key={stage.id} 
                stage={stage} 
                count={count} 
                isSelected={isSelected} 
                isNextStage={false}
                selectedStage={selectedStage} 
                onStageSelect={onStageSelect} 
              />,
              isLast
            );
          })}

          {renderStageWithArrow(
            <RejectedStageCard
              count={rejectedCount}
              isSelected={selectedStage === 'rejected'}
              onStageSelect={onStageSelect}
            />,
            true
          )}
        </div>
      </div>
    </div>
  );
};
