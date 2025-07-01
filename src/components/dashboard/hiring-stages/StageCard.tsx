
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { HiringStage } from "./types";

interface StageCardProps {
  stage: HiringStage;
  count: number;
  isSelected: boolean;
  isNextStage: boolean;
  selectedStage: string | null;
  onStageSelect: (stage: string) => void;
}

export const StageCard = ({
  stage,
  count,
  isSelected,
  isNextStage,
  selectedStage,
  onStageSelect
}: StageCardProps) => {
  const getStageKey = (stageName: string) => {
    return stageName.toLowerCase().replace(/\s+/g, '_');
  };

  const stageKey = getStageKey(stage.name);
  const isRejectedStage = stage.name.toLowerCase() === 'rejected';

  return (
    <div className="flex items-center gap-2">
      <div
        onClick={() => onStageSelect(stageKey)}
        className={`group relative glass-card cursor-pointer overflow-hidden flex-1 transition-all duration-300 ${
          isSelected
            ? 'ring-2 ring-opacity-20 scale-105 shadow-lg'
            : 'hover:scale-102 hover:shadow-md'
        } ${isRejectedStage ? 'border-red-200/50' : ''}`}
        style={{
          borderColor: isSelected ? stage.color : undefined,
        }}
      >
        <div className="p-3 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full transition-all duration-200"
                style={{ backgroundColor: stage.color }}
              ></div>
              <h3 className={`font-semibold text-xs transition-colors duration-200 ${
                isSelected ? 'text-foreground' : 'text-foreground/80'
              } ${isRejectedStage ? 'text-red-700' : ''}`}>
                {stage.name}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant={isSelected ? "default" : "secondary"}
              className={`text-base font-bold px-2 py-0.5 transition-all duration-200 ${
                isRejectedStage && !isSelected ? 'bg-red-50 text-red-700 border-red-200' : ''
              }`}
              style={{
                backgroundColor: isSelected ? stage.color : undefined,
                color: isSelected ? 'white' : undefined,
              }}
            >
              {count}
            </Badge>
            
            <div className="text-xs text-muted-foreground font-medium">
              {count === 1 ? 'Application' : 'Applications'}
            </div>
          </div>
        </div>
        
        {/* Colored accent bar */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
          }`}
          style={{ backgroundColor: stage.color }}
        ></div>
        
        {/* Subtle gradient overlay */}
        <div 
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{ 
            background: isSelected 
              ? `linear-gradient(to right, ${stage.color}08, transparent)` 
              : `linear-gradient(to right, ${stage.color}05, transparent)`
          }}
        ></div>
      </div>
      
      {/* Arrow connector - don't show after Rejected stage */}
      {isNextStage && !isRejectedStage && (
        <ArrowRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
      )}
    </div>
  );
};
