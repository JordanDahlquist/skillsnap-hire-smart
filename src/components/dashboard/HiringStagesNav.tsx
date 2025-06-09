
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HiringStage {
  id: string;
  name: string;
  order_index: number;
  color: string;
  is_default: boolean;
}

interface Application {
  id: string;
  pipeline_stage: string | null;
  status: string;
}

interface HiringStagesNavProps {
  jobId: string;
  applications: Application[];
  selectedStage: string | null;
  onStageSelect: (stage: string | null) => void;
}

export const HiringStagesNav = ({
  jobId,
  applications,
  selectedStage,
  onStageSelect
}: HiringStagesNavProps) => {
  const { data: stages = [], isLoading } = useQuery({
    queryKey: ['hiring-stages', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hiring_stages')
        .select('*')
        .eq('job_id', jobId)
        .order('order_index');
      
      if (error) throw error;
      return data as HiringStage[];
    },
    enabled: !!jobId,
  });

  // Calculate counts for each stage
  const getStageCounts = () => {
    const counts: Record<string, number> = {};
    stages.forEach(stage => {
      counts[stage.name.toLowerCase().replace(/\s+/g, '_')] = 0;
    });
    
    applications.forEach(app => {
      const stageKey = app.pipeline_stage || 'applied';
      if (counts.hasOwnProperty(stageKey)) {
        counts[stageKey]++;
      }
    });
    
    return counts;
  };

  const stageCounts = getStageCounts();
  const totalApplications = applications.length;

  if (isLoading) {
    return (
      <div className="border-b border-gray-200 bg-white">
        <div className="flex space-x-8 px-6 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getStageKey = (stageName: string) => {
    return stageName.toLowerCase().replace(/\s+/g, '_');
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex space-x-8 px-6 py-4">
        {/* All Applications Tab */}
        <button
          onClick={() => onStageSelect(null)}
          className={`flex flex-col items-center space-y-1 pb-2 border-b-2 transition-colors ${
            selectedStage === null
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="text-sm font-medium">All Applications</span>
          <Badge variant="secondary" className="text-xs">
            {totalApplications}
          </Badge>
        </button>

        {/* Stage Tabs */}
        {stages.map((stage) => {
          const stageKey = getStageKey(stage.name);
          const count = stageCounts[stageKey] || 0;
          const isSelected = selectedStage === stageKey;

          return (
            <button
              key={stage.id}
              onClick={() => onStageSelect(stageKey)}
              className={`flex flex-col items-center space-y-1 pb-2 border-b-2 transition-colors ${
                isSelected
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-sm font-medium">{stage.name}</span>
              <Badge 
                variant={isSelected ? "default" : "secondary"} 
                className="text-xs"
                style={{ backgroundColor: isSelected ? stage.color : undefined }}
              >
                {count}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
};
