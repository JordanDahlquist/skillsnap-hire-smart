import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ArrowRight } from "lucide-react";

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
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStageKey = (stageName: string) => {
    return stageName.toLowerCase().replace(/\s+/g, '_');
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-auto-fit gap-4" style={{ gridTemplateColumns: `repeat(${stages.length + 1}, minmax(200px, 1fr))` }}>
          
          {/* All Applications Card */}
          <div
            onClick={() => onStageSelect(null)}
            className={`group relative bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden ${
              selectedStage === null
                ? 'border-blue-500 ring-2 ring-blue-100 scale-105'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedStage === null ? 'bg-blue-500' : 'bg-gray-400'
                  } transition-colors duration-200`}></div>
                  <h3 className={`font-semibold text-sm ${
                    selectedStage === null ? 'text-blue-700' : 'text-gray-700'
                  } transition-colors duration-200`}>
                    All Applications
                  </h3>
                </div>
                <Users className={`w-4 h-4 ${
                  selectedStage === null ? 'text-blue-500' : 'text-gray-400'
                } transition-colors duration-200`} />
              </div>
              
              <div className="flex items-center justify-between">
                <Badge 
                  variant={selectedStage === null ? "default" : "secondary"}
                  className={`text-lg font-bold px-3 py-1 ${
                    selectedStage === null 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  } transition-all duration-200`}
                >
                  {totalApplications}
                </Badge>
                
                <div className="text-xs text-gray-500 font-medium">
                  Total
                </div>
              </div>
            </div>
            
            {/* Subtle gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              selectedStage === null ? 'opacity-100' : ''
            }`}></div>
          </div>

          {/* Stage Cards */}
          {stages.map((stage, index) => {
            const stageKey = getStageKey(stage.name);
            const count = stageCounts[stageKey] || 0;
            const isSelected = selectedStage === stageKey;
            const isNextStage = index < stages.length - 1;

            return (
              <div key={stage.id} className="flex items-center gap-3">
                <div
                  onClick={() => onStageSelect(stageKey)}
                  className={`group relative bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex-1 ${
                    isSelected
                      ? 'border-2 ring-2 ring-opacity-20 scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    borderColor: isSelected ? stage.color : undefined,
                  }}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full transition-all duration-200"
                          style={{ backgroundColor: stage.color }}
                        ></div>
                        <h3 className={`font-semibold text-sm transition-colors duration-200 ${
                          isSelected ? 'text-gray-800' : 'text-gray-700'
                        }`}>
                          {stage.name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={isSelected ? "default" : "secondary"}
                        className="text-lg font-bold px-3 py-1 transition-all duration-200"
                        style={{
                          backgroundColor: isSelected ? stage.color : undefined,
                          color: isSelected ? 'white' : undefined,
                        }}
                      >
                        {count}
                      </Badge>
                      
                      <div className="text-xs text-gray-500 font-medium">
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
                
                {/* Arrow connector */}
                {isNextStage && (
                  <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
