
import { UnifiedJobFormData } from "@/types/jobForm";

type EmploymentType = "full-time" | "part-time" | "contract" | "project";
type ExperienceLevel = "entry-level" | "mid-level" | "senior-level" | "executive";
type LocationType = "remote" | "office" | "hybrid";

const normalizeEmploymentType = (type: string): EmploymentType => {
  const normalized = type.toLowerCase().trim();
  
  if (normalized.includes('full') || normalized.includes('full-time')) return 'full-time';
  if (normalized.includes('part') || normalized.includes('part-time')) return 'part-time';
  if (normalized.includes('contract')) return 'contract';
  if (normalized.includes('project')) return 'project';
  
  return 'full-time'; // default
};

const normalizeExperienceLevel = (level: string): ExperienceLevel => {
  const normalized = level.toLowerCase().trim();
  
  if (normalized.includes('entry') || normalized.includes('junior') || normalized.includes('beginner')) return 'entry-level';
  if (normalized.includes('senior') || normalized.includes('lead') || normalized.includes('principal')) return 'senior-level';
  if (normalized.includes('executive') || normalized.includes('director') || normalized.includes('vp')) return 'executive';
  
  return 'mid-level'; // default
};

const normalizeLocationType = (type: string): LocationType => {
  const normalized = type.toLowerCase().trim();
  
  if (normalized.includes('remote')) return 'remote';
  if (normalized.includes('hybrid')) return 'hybrid';
  if (normalized.includes('office') || normalized.includes('on-site') || normalized.includes('onsite')) return 'office';
  
  return 'remote'; // default
};

export const autoPopulateFromOverview = (
  overview: string, 
  currentFormData: UnifiedJobFormData
): Partial<UnifiedJobFormData> => {
  const updates: Partial<UnifiedJobFormData> = {};
  
  // Extract job title
  if (!currentFormData.title) {
    const titleMatch = overview.match(/(?:for|seeking|hiring)\s+(?:a\s+)?([^,\n.]+?)(?:\s+(?:at|with|for)|$)/i);
    if (titleMatch) {
      updates.title = titleMatch[1].trim();
    }
  }
  
  // Extract company name
  if (!currentFormData.companyName) {
    const companyMatch = overview.match(/(?:at|for|with)\s+([A-Z][a-zA-Z\s&.,]+?)(?:\s+(?:we|they|is|are|looking|seeking)|[,.\n]|$)/);
    if (companyMatch) {
      updates.companyName = companyMatch[1].trim();
    }
  }
  
  // Extract employment type
  if (!currentFormData.employmentType || currentFormData.employmentType === 'full-time') {
    const typeMatch = overview.match(/(full[- ]?time|part[- ]?time|contract|project|freelance)/i);
    if (typeMatch) {
      updates.employmentType = normalizeEmploymentType(typeMatch[1]);
    }
  }
  
  // Extract experience level
  if (!currentFormData.experienceLevel || currentFormData.experienceLevel === 'mid-level') {
    const levelMatch = overview.match(/(entry[- ]?level|junior|senior|lead|principal|director|executive|beginner|intermediate|advanced)/i);
    if (levelMatch) {
      updates.experienceLevel = normalizeExperienceLevel(levelMatch[1]);
    }
  }
  
  // Extract location type
  if (!currentFormData.locationType || currentFormData.locationType === 'remote') {
    const locationMatch = overview.match(/(remote|hybrid|on[- ]?site|office)/i);
    if (locationMatch) {
      updates.locationType = normalizeLocationType(locationMatch[1]);
    }
  }
  
  return updates;
};
