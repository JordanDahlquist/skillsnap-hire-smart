
// Enhanced role type synonyms for better flexible matching
const roleTypeSynonyms: Record<string, string[]> = {
  designer: ["branding", "design", "graphic", "ui", "ux", "creative", "visual", "art"],
  developer: ["programming", "coding", "frontend", "backend", "fullstack", "react", "javascript", "python", "software", "web", "app"],
  marketer: ["marketing", "branding", "advertising", "social media", "seo", "digital marketing", "growth"],
  analyst: ["data", "analytics", "business intelligence", "reporting", "research", "insights"],
  writer: ["content", "copywriting", "blogging", "technical writing", "journalism", "editing"],
  manager: ["project management", "product management", "team lead", "coordinator", "director"],
  consultant: ["consulting", "strategy", "advisory", "expert", "specialist"],
  sales: ["sales", "business development", "account management", "customer success"]
};

// Enhanced flexible search function with better partial matching
export const matchesSearchTerm = (job: any, searchTerm: string): boolean => {
  if (!searchTerm || searchTerm.trim() === "") return true;
  
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const searchWords = normalizedSearchTerm.split(/\s+/).filter(word => word.length > 0);
  
  const searchableContent = [
    job.title || '',
    job.description || '',
    job.required_skills || '',
    job.role_type || '',
    job.city || '',
    job.state || '',
    job.country || ''
  ].join(' ').toLowerCase();
  
  // More flexible matching - require at least 60% of search words to match
  const matchedWords = searchWords.filter(word => {
    if (searchableContent.includes(word)) return true;
    
    // Partial word matching for words longer than 3 characters
    if (word.length > 3) {
      const contentWords = searchableContent.split(/\s+/);
      return contentWords.some(jobWord => {
        return jobWord.includes(word) || 
               word.includes(jobWord) ||
               (jobWord.length > 3 && word.length > 3 && 
                (jobWord.startsWith(word.substring(0, 4)) || word.startsWith(jobWord.substring(0, 4))));
      });
    }
    
    return false;
  });
  
  // Require at least 60% match, but at least 1 word for short searches
  const requiredMatches = Math.max(1, Math.ceil(searchWords.length * 0.6));
  return matchedWords.length >= requiredMatches;
};

// Enhanced role matching with better synonym support
export const findBestRoleMatch = (value: string, availableValues: string[]): string => {
  if (!value || value === "all") return "all";
  
  const normalizedValue = value.toLowerCase();
  
  // Exact match first
  const exactMatch = availableValues.find(av => av.toLowerCase() === normalizedValue);
  if (exactMatch) return exactMatch;
  
  // Partial match
  const partialMatch = availableValues.find(av => 
    av.toLowerCase().includes(normalizedValue) || 
    normalizedValue.includes(av.toLowerCase())
  );
  if (partialMatch) return partialMatch;
  
  // Enhanced synonym matching
  for (const [roleType, synonyms] of Object.entries(roleTypeSynonyms)) {
    if (synonyms.some(synonym => normalizedValue.includes(synonym) || synonym.includes(normalizedValue))) {
      const matchingRole = availableValues.find(av => av.toLowerCase().includes(roleType));
      if (matchingRole) return matchingRole;
    }
  }
  
  // If no match found, prefer "all" for flexibility
  return "all";
};

// Smart filter matching with fallbacks
export const findBestMatch = (value: string, availableValues: string[]): string => {
  if (!value || value === "all") return "all";
  
  // Exact match first
  const exactMatch = availableValues.find(av => av.toLowerCase() === value.toLowerCase());
  if (exactMatch) return exactMatch;
  
  // Partial match
  const partialMatch = availableValues.find(av => 
    av.toLowerCase().includes(value.toLowerCase()) || 
    value.toLowerCase().includes(av.toLowerCase())
  );
  if (partialMatch) return partialMatch;
  
  return "all";
};
