
import { Application } from "./types";

export const getStageCounts = (applications: Application[], stages: any[]) => {
  const counts: Record<string, number> = {};
  
  // Initialize counts for all stages including rejected
  stages.forEach(stage => {
    counts[stage.name.toLowerCase().replace(/\s+/g, '_')] = 0;
  });
  
  // Add rejected stage count if not already included
  if (!counts.hasOwnProperty('rejected')) {
    counts['rejected'] = 0;
  }
  
  applications.forEach(app => {
    const stageKey = app.pipeline_stage || 'applied';
    if (counts.hasOwnProperty(stageKey)) {
      counts[stageKey]++;
    }
  });
  
  return counts;
};

export const getStageKey = (stageName: string) => {
  return stageName.toLowerCase().replace(/\s+/g, '_');
};
