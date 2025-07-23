
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { useHiringStages } from "@/hooks/useHiringStages";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  const handleStageChange = (newStage: string) => {
    console.log('StageSelector change initiated:', { applicationId, newStage, currentStage });
    updateApplicationStage({ applicationId, stage: newStage });
    onStageChange?.(applicationId, newStage);
    setIsOpen(false);
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

  // Get the display name for the current stage (clean, without parenthetical text)
  const getCurrentStageName = () => {
    const stageKey = getCurrentStageKey();
    const stage = stages.find(s => getStageKey(s.name) === stageKey);
    return stage ? stage.name : "Applied";
  };

  // Get the color for the current stage
  const getCurrentStageColor = () => {
    const stageKey = getCurrentStageKey();
    const stage = stages.find(s => getStageKey(s.name) === stageKey);
    return stage ? stage.color : "#6b7280"; // Default gray color
  };

  return (
    <Select
      value={getCurrentStageKey()}
      onValueChange={handleStageChange}
      disabled={isUpdating}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={`
            ${size === "sm" ? "h-11 px-6" : "h-14 px-8"} 
            rounded-2xl 
            text-white 
            border-0
            hover:opacity-90
            transition-all duration-200
            gap-2
          `}
          style={{ backgroundColor: getCurrentStageColor() }}
          disabled={isUpdating}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full bg-white/30 flex-shrink-0" 
            />
            <span className="truncate">{getCurrentStageName()}</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-70" />
        </Button>
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
