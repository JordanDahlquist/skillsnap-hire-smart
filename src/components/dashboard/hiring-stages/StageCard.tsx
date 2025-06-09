
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

  return (
    <div className="flex items-center gap-2 w-32 md:w-full flex-shrink-0">
      <div
        onClick={() => onStageSelect(stageKey)}
        className={`group relative bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden w-full ${
          isSelected
            ? 'border-2 ring-2 ring-opacity-20 scale-105'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        style={{
          borderColor: isSelected ? stage.color : undefined,
        }}
      >
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <div 
              className="w-2 h-2 rounded-full transition-all duration-200"
              style={{ backgroundColor: stage.color }}
            ></div>
          </div>
          
          <h3 className={`font-semibold text-xs md:text-sm mb-2 transition-colors duration-200 truncate ${
            isSelected ? 'text-gray-800' : 'text-gray-700'
          }`} title={stage.name}>
            {stage.name}
          </h3>
          
          <Badge 
            variant={isSelected ? "default" : "secondary"}
            className="text-sm font-bold px-2 py-1 transition-all duration-200 w-full justify-center"
            style={{
              backgroundColor: isSelected ? stage.color : undefined,
              color: isSelected ? 'white' : undefined,
            }}
          >
            {count}
          </Badge>
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
          className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isSelected ? 'opacity-100' : ''
          }`}
          style={{ 
            background: isSelected 
              ? `linear-gradient(to right, ${stage.color}08, transparent)` 
              : `linear-gradient(to right, ${stage.color}05, transparent)`
          }}
        ></div>
      </div>
      
      {/* Arrow connector - only show on mobile and when it's not the last stage */}
      {isNextStage && (
        <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0 md:hidden" />
      )}
    </div>
  );
};
