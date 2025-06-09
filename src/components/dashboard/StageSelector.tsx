
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
      <SelectTrigger 
        className={`
          ${size === "sm" ? "h-9" : "h-10"} 
          w-auto min-w-[120px] 
          border border-input 
          bg-background 
          hover:bg-accent 
          hover:text-accent-foreground 
          text-sm 
          px-3
          focus:ring-2 
          focus:ring-ring 
          focus:ring-offset-2
        `}
      >
        <SelectValue placeholder={getCurrentStageName()} />
      </SelectTrigger>
      <SelectContent className="bg-popover border border-border shadow-md z-50">
        {stages.map((stage) => (
          <SelectItem 
            key={stage.id} 
            value={getStageKey(stage.name)}
            className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
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
