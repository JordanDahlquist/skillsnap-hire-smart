
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

  return (
    <>
      <DropdownMenuItem disabled className="font-medium text-xs text-gray-500 uppercase tracking-wide">
        Move to Stage
      </DropdownMenuItem>
      {stages.map((stage) => (
        <DropdownMenuItem
          key={stage.id}
          onClick={() => onStageChange(getStageKey(stage.name))}
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
    </>
  );
};
