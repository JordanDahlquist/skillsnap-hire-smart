
import React from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useHiringStages } from '@/hooks/useHiringStages';

interface BulkStageSelectorProps {
  jobId: string;
  onStageChange: (stage: string) => void;
  disabled?: boolean;
}

export const BulkStageSelector = ({ jobId, onStageChange, disabled }: BulkStageSelectorProps) => {
  const { stages } = useHiringStages(jobId);

  const getStageKey = (stageName: string) => {
    return stageName.toLowerCase().replace(/\s+/g, '_');
  };

  if (stages.length === 0) return null;

  // Separate rejected stage from other stages
  const activeStages = stages.filter(stage => stage.name.toLowerCase() !== 'rejected');
  const rejectedStage = stages.find(stage => stage.name.toLowerCase() === 'rejected');

  const handleStageChange = (stageKey: string) => {
    console.log('Bulk stage change initiated:', stageKey);
    onStageChange(stageKey);
  };

  return (
    <>
      <DropdownMenuItem disabled className="font-medium text-xs text-gray-500 uppercase tracking-wide">
        Move to Stage
      </DropdownMenuItem>
      {activeStages.map((stage) => (
        <DropdownMenuItem
          key={stage.id}
          onClick={() => handleStageChange(getStageKey(stage.name))}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: stage.color }}
            />
            {stage.name}
          </div>
        </DropdownMenuItem>
      ))}
      
      {/* Separator for rejected stage */}
      {rejectedStage && (
        <>
          <DropdownMenuItem disabled className="h-px bg-border my-1" />
          <DropdownMenuItem
            key={rejectedStage.id}
            onClick={() => handleStageChange(getStageKey(rejectedStage.name))}
            disabled={disabled}
            className="text-red-600"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: rejectedStage.color }}
              />
              {rejectedStage.name}
            </div>
          </DropdownMenuItem>
        </>
      )}
    </>
  );
};
