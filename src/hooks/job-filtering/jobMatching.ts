
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

// Simplified and more reliable search function
export const matchesSearchTerm = (job: any, searchTerm: string): boolean => {
  if (!searchTerm || searchTerm.trim() === "") return true;
  
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  console.log('Searching for:', normalizedSearchTerm);
  
  // Get all searchable content from the job
  const searchableFields = [
    job.title || '',
    job.description || '',
    job.required_skills || '',
    job.role_type || '',
    job.city || '',
    job.state || '',
    job.country || ''
  ];
  
  const searchableContent = searchableFields.join(' ').toLowerCase();
  console.log('Job content sample:', job.title, '- Full content length:', searchableContent.length);
  
  // Priority 1: Direct substring match (most important for user expectations)
  if (searchableContent.includes(normalizedSearchTerm)) {
    console.log('✓ Direct match found for:', normalizedSearchTerm);
    return true;
  }
  
  // Priority 2: Word-by-word matching for multi-word searches
  const searchWords = normalizedSearchTerm.split(/\s+/).filter(word => word.length > 0);
  
  if (searchWords.length === 1) {
    // Single word search - already checked above, return false
    console.log('✗ No match found for single word:', normalizedSearchTerm);
    return false;
  }
  
  // For multi-word searches, require at least 70% of words to match
  const matchedWords = searchWords.filter(word => {
    // Check direct inclusion first
    if (searchableContent.includes(word)) {
      return true;
    }
    
    // For longer words (4+ chars), check partial matches
    if (word.length >= 4) {
      const contentWords = searchableContent.split(/\s+/);
      return contentWords.some(jobWord => {
        return jobWord.includes(word) || word.includes(jobWord);
      });
    }
    
    return false;
  });
  
  const requiredMatches = Math.ceil(searchWords.length * 0.7);
  const hasMatch = matchedWords.length >= requiredMatches;
  
  console.log(`Multi-word search: ${matchedWords.length}/${searchWords.length} words matched (need ${requiredMatches}):`, hasMatch);
  
  return hasMatch;
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
