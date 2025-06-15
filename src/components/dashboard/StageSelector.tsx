
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

  // Get the stage key in the format expected by the backend (lowercase with underscores)
  const getStageKey = (stageName: string) => {
    return stageName.toLowerCase().replace(/\s+/g, '_');
  };

  // Find the current stage or default to "applied"
  const getCurrentStageKey = () => {
    if (!currentStage) return 'applied';
    
    // Check if current stage matches any existing stage
    const matchingStage = stages.find(stage => 
      getStageKey(stage.name) === currentStage || 
      stage.name.toLowerCase() === currentStage.toLowerCase()
    );
    
    // If we found a matching stage, return its normalized key
    if (matchingStage) {
      return getStageKey(matchingStage.name);
    }
    
    // Default to "applied" if no match found
    return 'applied';
  };

  // Get the display name for the current stage
  const getCurrentStageName = () => {
    const stageKey = getCurrentStageKey();
    const stage = stages.find(s => getStageKey(s.name) === stageKey);
    return stage ? stage.name : "Applied";
  };

  return (
    <Select
      value={getCurrentStageKey()}
      onValueChange={handleStageChange}
      disabled={isUpdating}
    >
      <SelectTrigger 
        className={`
          ${size === "sm" ? "h-9" : "h-11"} 
          w-auto min-w-[120px] 
          glass-card
          hover:bg-card/90 hover:border-border/60
          text-sm 
          px-3
          focus:ring-2 
          focus:ring-ring 
          focus:ring-offset-2
          transition-all duration-300
        `}
      >
        <SelectValue placeholder={getCurrentStageName()} />
      </SelectTrigger>
      <SelectContent className="glass-card z-50 rounded-xl">
        {stages.map((stage) => (
          <SelectItem 
            key={stage.id} 
            value={getStageKey(stage.name)}
            className="hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-lg mx-1"
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
