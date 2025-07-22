
import { Application } from '@/types';

export const calculateTopCandidates = (applications: Application[]): Set<string> => {
  const topCandidateIds = new Set<string>();
  
  // Filter applications that have AI ratings
  const applicationsWithRatings = applications.filter(app => 
    app.ai_rating !== null && app.ai_rating !== undefined
  );
  
  if (applicationsWithRatings.length === 0) {
    return topCandidateIds;
  }
  
  // Sort by AI rating (highest first)
  const sortedApplications = applicationsWithRatings.sort((a, b) => 
    (b.ai_rating || 0) - (a.ai_rating || 0)
  );
  
  // Get top 10% of candidates
  const topCount = Math.max(1, Math.ceil(sortedApplications.length * 0.1));
  const topApplications = sortedApplications.slice(0, topCount);
  
  // Only include candidates with rating >= 2.5
  topApplications.forEach(app => {
    if (app.ai_rating && app.ai_rating >= 2.5) {
      topCandidateIds.add(app.id);
    }
  });
  
  return topCandidateIds;
};

export const getTopCandidateThreshold = (applications: Application[]): number | null => {
  const applicationsWithRatings = applications.filter(app => 
    app.ai_rating !== null && app.ai_rating !== undefined
  );
  
  if (applicationsWithRatings.length === 0) {
    return null;
  }
  
  const sortedApplications = applicationsWithRatings.sort((a, b) => 
    (b.ai_rating || 0) - (a.ai_rating || 0)
  );
  
  const topCount = Math.max(1, Math.ceil(sortedApplications.length * 0.1));
  const topApplications = sortedApplications.slice(0, topCount);
  
  return topApplications.length > 0 ? (topApplications[topApplications.length - 1].ai_rating || 0) : 0;
};
