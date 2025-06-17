
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

const extractJobTitle = (overview: string): string | null => {
  console.log('Extracting job title from:', overview);
  
  // Multiple patterns to extract job titles
  const patterns = [
    // "Senior React Developer for..." or "Senior React Developer at..."
    /^([^,\n.]+?)(?:\s+(?:for|at|with|in)\s)/i,
    // "Looking for a Senior React Developer" or "Seeking a Senior React Developer"
    /(?:looking for|seeking|hiring|need)\s+(?:a\s+)?([^,\n.]+?)(?:\s+(?:for|at|with|in|$))/i,
    // "We need a Senior React Developer"
    /(?:we need|we're looking for|we're seeking)\s+(?:a\s+)?([^,\n.]+?)(?:\s+(?:for|at|with|in|$))/i,
    // "Position: Senior React Developer" or "Role: Senior React Developer"
    /(?:position|role|job):\s*([^,\n.]+)/i,
    // Fallback: first meaningful phrase before common separators
    /^([A-Za-z\s]+?)(?:\s+(?:for|at|with|in|position|role|job)|\s*[,-])/i
  ];

  for (const pattern of patterns) {
    const match = overview.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim();
      // Filter out common non-title words
      if (title.length > 2 && !['the', 'a', 'an', 'we', 'our', 'company'].includes(title.toLowerCase())) {
        console.log('Extracted job title:', title);
        return title;
      }
    }
  }

  console.log('No job title extracted');
  return null;
};

const extractLocation = (overview: string): string | null => {
  console.log('Extracting location from:', overview);
  
  // Patterns to extract location
  const patterns = [
    // "in Los Angeles", "in NYC", "in San Francisco"
    /\sin\s+([A-Z][a-zA-Z\s,]+?)(?:\s|$|,|\.|!|\?)/,
    // "based in Los Angeles", "located in NYC"
    /(?:based|located)\s+in\s+([A-Z][a-zA-Z\s,]+?)(?:\s|$|,|\.|!|\?)/i,
    // "Los Angeles based", "NYC located"
    /([A-Z][a-zA-Z\s,]+?)\s+(?:based|located)(?:\s|$|,|\.|!|\?)/i,
    // "at our Los Angeles office", "from our NYC location"
    /(?:at our|from our)\s+([A-Z][a-zA-Z\s,]+?)\s+(?:office|location|headquarters)/i,
    // Specific city patterns (common format)
    /(?:^|\s)([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),?\s*(?:[A-Z]{2}|[A-Z][a-z]+)(?:\s|$|,|\.|!|\?)/
  ];

  for (const pattern of patterns) {
    const match = overview.match(pattern);
    if (match && match[1]) {
      const location = match[1].trim().replace(/,$/, ''); // Remove trailing comma
      // Filter out common non-location words
      if (location.length > 2 && !['the', 'our', 'this', 'that', 'company', 'agency', 'startup'].includes(location.toLowerCase())) {
        console.log('Extracted location:', location);
        return location;
      }
    }
  }

  console.log('No location extracted');
  return null;
};

const extractCompanyType = (overview: string): string | null => {
  console.log('Extracting company type from:', overview);
  
  // Patterns to extract company context
  const patterns = [
    // "for a dev agency", "for a marketing company", "at a tech startup"
    /(?:for|at)\s+(?:a\s+|an\s+)?([^,\n.]+?)(?:\s+(?:in|based|located)|$|,|\.|!|\?)/i,
    // "dev agency in", "marketing company based"
    /([a-zA-Z\s]+(?:agency|company|startup|corporation|firm|business|organization))/i
  ];

  for (const pattern of patterns) {
    const match = overview.match(pattern);
    if (match && match[1]) {
      const companyType = match[1].trim();
      console.log('Extracted company type:', companyType);
      return companyType;
    }
  }

  console.log('No company type extracted');
  return null;
};

export const autoPopulateFromOverview = (
  overview: string, 
  currentFormData: UnifiedJobFormData
): Partial<UnifiedJobFormData> => {
  console.log('=== AUTO-POPULATION STARTED ===');
  console.log('Overview text:', overview);
  console.log('Current form data:', currentFormData);
  
  const updates: Partial<UnifiedJobFormData> = {};
  
  // Extract job title - only if current title is empty or default
  if (!currentFormData.title || currentFormData.title.trim() === '') {
    const extractedTitle = extractJobTitle(overview);
    if (extractedTitle) {
      updates.title = extractedTitle;
      console.log('Will update title to:', extractedTitle);
    }
  } else {
    console.log('Skipping title extraction - field already has value:', currentFormData.title);
  }
  
  // Extract location - only if current location is empty
  if (!currentFormData.location || currentFormData.location.trim() === '') {
    const extractedLocation = extractLocation(overview);
    if (extractedLocation) {
      updates.location = extractedLocation;
      console.log('Will update location to:', extractedLocation);
    }
  } else {
    console.log('Skipping location extraction - field already has value:', currentFormData.location);
  }
  
  // Extract company name from company type if no company name exists
  if (!currentFormData.companyName || currentFormData.companyName.trim() === '') {
    const companyType = extractCompanyType(overview);
    if (companyType) {
      // Don't set generic terms as company names, but could be useful for context
      if (!['agency', 'company', 'startup', 'firm', 'business'].includes(companyType.toLowerCase().trim())) {
        updates.companyName = companyType;
        console.log('Will update company name to:', companyType);
      }
    }
  } else {
    console.log('Skipping company name extraction - field already has value:', currentFormData.companyName);
  }
  
  // Extract employment type - only if default
  if (!currentFormData.employmentType || currentFormData.employmentType === 'full-time') {
    const typeMatch = overview.match(/(full[- ]?time|part[- ]?time|contract|project|freelance)/i);
    if (typeMatch) {
      const normalized = normalizeEmploymentType(typeMatch[1]);
      updates.employmentType = normalized;
      console.log('Will update employment type to:', normalized);
    }
  }
  
  // Extract experience level - only if default
  if (!currentFormData.experienceLevel || currentFormData.experienceLevel === 'mid-level') {
    const levelMatch = overview.match(/(entry[- ]?level|junior|senior|lead|principal|director|executive|beginner|intermediate|advanced)/i);
    if (levelMatch) {
      const normalized = normalizeExperienceLevel(levelMatch[1]);
      updates.experienceLevel = normalized;
      console.log('Will update experience level to:', normalized);
    }
  }
  
  // Extract location type - only if default
  if (!currentFormData.locationType || currentFormData.locationType === 'remote') {
    const locationMatch = overview.match(/(remote|hybrid|on[- ]?site|office)/i);
    if (locationMatch) {
      const normalized = normalizeLocationType(locationMatch[1]);
      updates.locationType = normalized;
      console.log('Will update location type to:', normalized);
    }
  }
  
  console.log('=== AUTO-POPULATION COMPLETE ===');
  console.log('Updates to apply:', updates);
  
  return updates;
};
