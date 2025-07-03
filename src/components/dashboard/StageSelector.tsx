
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
    console.log('StageSelector change initiated:', { applicationId, newStage, currentStage });
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
          border border-border 
          bg-background/80 backdrop-blur-sm
          hover:bg-accent 
          hover:text-accent-foreground 
          text-sm 
          px-3
          focus:ring-2 
          focus:ring-ring 
          focus:ring-offset-2
          transition-all duration-200
        `}
        title="Change pipeline stage (automatically updates status)"
      >
        <SelectValue placeholder={getCurrentStageName()} />
      </SelectTrigger>
      <SelectContent className="bg-popover/95 backdrop-blur-md border border-border shadow-md z-50">
        {stages.map((stage) => {
          const stageKey = getStageKey(stage.name);
          const isRejectedStage = stage.name.toLowerCase() === 'rejected';
          
          return (
            <SelectItem 
              key={stage.id} 
              value={stageKey}
              className={`hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                isRejectedStage ? 'text-red-600' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: stage.color }}
                />
                {stage.name}
                {isRejectedStage && (
                  <span className="text-xs opacity-70">(sets status to rejected)</span>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
