
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHiringStages } from "@/hooks/useHiringStages";

interface StageSelectorProps {
  jobId: string;
  currentStage: string | null;
  applicationId: string;
  onStageChange?: (applicationId: string, newStage: string) => void;
  size?: "sm" | "default";
}

export const StageSelector = ({
  jobId,
  currentStage,
  applicationId,
  onStageChange,
  size = "default"
}: StageSelectorProps) => {
  const { stages, updateApplicationStage, isUpdating } = useHiringStages(jobId);

  const handleStageChange = (newStage: string) => {
    updateApplicationStage({ applicationId, stage: newStage });
    onStageChange?.(applicationId, newStage);
  };

  const getCurrentStageName = () => {
    if (!currentStage) return "Applied";
    const stage = stages.find(s => s.name.toLowerCase().replace(/\s+/g, '_') === currentStage);
    return stage ? stage.name : "Applied";
  };

  const getStageKey = (stageName: string) => {
    return stageName.toLowerCase().replace(/\s+/g, '_');
  };

  return (
    <Select
      value={currentStage || 'applied'}
      onValueChange={handleStageChange}
      disabled={isUpdating}
    >
      <SelectTrigger className={size === "sm" ? "h-7 text-xs" : "h-8 text-sm"}>
        <SelectValue placeholder={getCurrentStageName()} />
      </SelectTrigger>
      <SelectContent>
        {stages.map((stage) => (
          <SelectItem key={stage.id} value={getStageKey(stage.name)}>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: stage.color }}
              />
              {stage.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
