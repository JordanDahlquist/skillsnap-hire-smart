
import { Application } from "./types";

export const getStageCounts = (applications: Application[], stages: any[]) => {
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

export const getStageKey = (stageName: string) => {
  return stageName.toLowerCase().replace(/\s+/g, '_');
};
