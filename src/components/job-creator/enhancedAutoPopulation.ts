
import { UnifiedJobFormData, CompanyAnalysisData } from "@/types/jobForm";

type EmploymentType = "full-time" | "part-time" | "contract" | "project";
type ExperienceLevel = "entry-level" | "mid-level" | "senior-level" | "executive";
type LocationType = "remote" | "office" | "hybrid";

// Market-based salary data for intelligent suggestions
const SALARY_DATABASE = {
  // Tech roles salary ranges (base amounts in thousands)
  roles: {
    'react developer': { 'entry-level': [70, 95], 'mid-level': [95, 130], 'senior-level': [130, 180], executive: [180, 250] },
    'frontend developer': { 'entry-level': [65, 90], 'mid-level': [90, 125], 'senior-level': [125, 170], executive: [170, 230] },
    'backend developer': { 'entry-level': [75, 100], 'mid-level': [100, 135], 'senior-level': [135, 185], executive: [185, 260] },
    'full stack developer': { 'entry-level': [70, 95], 'mid-level': [95, 130], 'senior-level': [130, 180], executive: [180, 250] },
    'software engineer': { 'entry-level': [75, 100], 'mid-level': [100, 135], 'senior-level': [135, 185], executive: [185, 260] },
    'data scientist': { 'entry-level': [85, 110], 'mid-level': [110, 150], 'senior-level': [150, 200], executive: [200, 280] },
    'product manager': { 'entry-level': [80, 105], 'mid-level': [105, 140], 'senior-level': [140, 190], executive: [190, 270] },
    'designer': { 'entry-level': [60, 85], 'mid-level': [85, 115], 'senior-level': [115, 155], executive: [155, 210] },
    'ui designer': { 'entry-level': [55, 80], 'mid-level': [80, 110], 'senior-level': [110, 150], executive: [150, 200] },
    'ux designer': { 'entry-level': [65, 90], 'mid-level': [90, 120], 'senior-level': [120, 160], executive: [160, 220] },
    'devops engineer': { 'entry-level': [80, 105], 'mid-level': [105, 140], 'senior-level': [140, 190], executive: [190, 270] },
    'mobile developer': { 'entry-level': [70, 95], 'mid-level': [95, 130], 'senior-level': [130, 180], executive: [180, 250] },
    'ios developer': { 'entry-level': [75, 100], 'mid-level': [100, 135], 'senior-level': [135, 185], executive: [185, 260] },
    'android developer': { 'entry-level': [70, 95], 'mid-level': [95, 130], 'senior-level': [130, 180], executive: [180, 250] },
    'qa engineer': { 'entry-level': [55, 80], 'mid-level': [80, 110], 'senior-level': [110, 150], executive: [150, 200] },
    'marketing specialist': { 'entry-level': [45, 65], 'mid-level': [65, 90], 'senior-level': [90, 125], executive: [125, 175] },
    'content writer': { 'entry-level': [35, 55], 'mid-level': [55, 75], 'senior-level': [75, 105], executive: [105, 145] },
    'sales representative': { 'entry-level': [40, 60], 'mid-level': [60, 85], 'senior-level': [85, 120], executive: [120, 170] }
  },
  
  // Location multipliers for cost of living adjustments
  locations: {
    'san francisco': 1.4, 'san francisco, ca': 1.4, 'sf': 1.4,
    'new york': 1.3, 'new york, ny': 1.3, 'nyc': 1.3, 'new york city': 1.3,
    'los angeles': 1.2, 'los angeles, ca': 1.2, 'la': 1.2,
    'seattle': 1.25, 'seattle, wa': 1.25,
    'boston': 1.2, 'boston, ma': 1.2,
    'washington': 1.15, 'washington, dc': 1.15, 'dc': 1.15,
    'chicago': 1.1, 'chicago, il': 1.1,
    'austin': 1.05, 'austin, tx': 1.05,
    'denver': 1.0, 'denver, co': 1.0,
    'atlanta': 0.95, 'atlanta, ga': 0.95,
    'miami': 0.95, 'miami, fl': 0.95,
    'dallas': 0.9, 'dallas, tx': 0.9,
    'phoenix': 0.85, 'phoenix, az': 0.85,
    'remote': 0.95, 'worldwide': 0.9
  }
};

// Default salary ranges as final fallback
const DEFAULT_SALARY_RANGES = {
  'entry-level': [60, 85],
  'mid-level': [85, 115],
  'senior-level': [115, 155],
  'executive': [155, 210]
};

// Enhanced city to state mapping for better location detection
const CITY_STATE_MAP: { [key: string]: string } = {
  'los angeles': 'Los Angeles, CA',
  'la': 'Los Angeles, CA',
  'new york': 'New York, NY',
  'new york city': 'New York, NY',
  'nyc': 'New York, NY',
  'san francisco': 'San Francisco, CA',
  'sf': 'San Francisco, CA',
  'chicago': 'Chicago, IL',
  'houston': 'Houston, TX',
  'phoenix': 'Phoenix, AZ',
  'philadelphia': 'Philadelphia, PA',
  'san antonio': 'San Antonio, TX',
  'san diego': 'San Diego, CA',
  'dallas': 'Dallas, TX',
  'austin': 'Austin, TX',
  'seattle': 'Seattle, WA',
  'denver': 'Denver, CO',
  'boston': 'Boston, MA',
  'miami': 'Miami, FL',
  'atlanta': 'Atlanta, GA',
  'washington': 'Washington, DC',
  'dc': 'Washington, DC'
};

// Related skills mapping for common roles
const ROLE_SKILLS_MAP: { [key: string]: string[] } = {
  'react': ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js'],
  'frontend': ['JavaScript', 'HTML', 'CSS', 'TypeScript', 'React'],
  'backend': ['Node.js', 'Python', 'SQL', 'API', 'Database'],
  'full stack': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL'],
  'mobile': ['React Native', 'iOS', 'Android', 'JavaScript'],
  'data': ['Python', 'SQL', 'Machine Learning', 'Analytics', 'Statistics'],
  'devops': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
  'ui': ['Figma', 'Adobe', 'Design Systems', 'Prototyping'],
  'ux': ['User Research', 'Wireframing', 'Prototyping', 'Figma']
};

// Enhanced text processing utilities
const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const formatJobTitle = (title: string): string => {
  const specialCases = {
    'ui': 'UI', 'ux': 'UX', 'api': 'API', 'cto': 'CTO', 'ceo': 'CEO', 'cfo': 'CFO',
    'vp': 'VP', 'ai': 'AI', 'ml': 'ML', 'ios': 'iOS', 'android': 'Android',
    'react': 'React', 'vue': 'Vue', 'angular': 'Angular', 'node': 'Node',
    'javascript': 'JavaScript', 'typescript': 'TypeScript', 'python': 'Python',
    'java': 'Java', 'c#': 'C#', 'c++': 'C++', 'php': 'PHP', 'sql': 'SQL',
    'aws': 'AWS', 'gcp': 'GCP', 'devops': 'DevOps', 'qa': 'QA'
  };

  let formatted = toTitleCase(title.trim());
  
  Object.entries(specialCases).forEach(([key, value]) => {
    const escapedKey = escapeRegex(key);
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'gi');
    formatted = formatted.replace(regex, value);
  });
  
  return formatted;
};

const extractSkills = (text: string, jobTitle?: string): string => {
  const skillPatterns = [
    // Programming languages
    /\b(JavaScript|TypeScript|Python|Java|C#|C\+\+|PHP|Ruby|Go|Rust|Swift|Kotlin|Scala|R)\b/gi,
    // Frameworks and libraries
    /\b(React|Vue|Angular|Node\.?js|Express|Django|Flask|Spring|Laravel|Rails|Symfony)\b/gi,
    // Technologies
    /\b(HTML|CSS|SCSS|SASS|Bootstrap|Tailwind|jQuery|MongoDB|PostgreSQL|MySQL|Redis|Docker|Kubernetes|AWS|Azure|GCP)\b/gi,
    // Tools
    /\b(Git|GitHub|GitLab|Jira|Figma|Adobe|Photoshop|Sketch|Jenkins|CI\/CD|Terraform|Ansible)\b/gi
  ];

  const skills = new Set<string>();
  
  // Extract skills from job title and add related skills
  if (jobTitle) {
    const titleLower = jobTitle.toLowerCase();
    
    // Add skills mentioned in title
    Object.keys(ROLE_SKILLS_MAP).forEach(role => {
      if (titleLower.includes(role)) {
        // Add the primary skill
        skills.add(formatJobTitle(role));
        // Add related skills
        ROLE_SKILLS_MAP[role].forEach(skill => skills.add(skill));
      }
    });
    
    // Check for specific technologies in title
    const titleWords = titleLower.split(/\s+/);
    titleWords.forEach(word => {
      if (['react', 'vue', 'angular', 'node', 'python', 'java', 'javascript', 'typescript'].includes(word)) {
        skills.add(formatJobTitle(word));
        // Add related skills if available
        if (ROLE_SKILLS_MAP[word]) {
          ROLE_SKILLS_MAP[word].forEach(skill => skills.add(skill));
        }
      }
    });
  }
  
  // Extract skills from text content
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => skills.add(match));
    }
  });

  // Remove duplicates (case-insensitive)
  const uniqueSkills = new Set<string>();
  const lowerSkills = new Set<string>();
  
  skills.forEach(skill => {
    const lowerSkill = skill.toLowerCase();
    if (!lowerSkills.has(lowerSkill)) {
      lowerSkills.add(lowerSkill);
      uniqueSkills.add(skill);
    }
  });

  return Array.from(uniqueSkills).join(', ');
};

const extractLocation = (text: string): string => {
  // Enhanced location patterns to handle various formats
  const locationPatterns = [
    // "in City" - try to match with our city mapping first
    /\bin\s+([a-zA-Z\s]+?)(?:\s|$|,|\.|!|\?)/i,
    // "at [company] in City"
    /\bat\s+[^,\n]*?\s+in\s+([a-zA-Z\s]+?)(?:\s|$|,|\.|!|\?)/i,
    // "based in City, State"
    /(?:based|located)\s+in\s+([A-Z][a-zA-Z\s,]+?)(?:\s|$|,|\.|!|\?)/i,
    // "City, State based" or "City State based"
    /([A-Z][a-zA-Z\s]+?,?\s*[A-Z]{2,})\s+(?:based|located)(?:\s|$|,|\.|!|\?)/i,
    // Direct city/state mentions
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+([A-Z]{2})\b/,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+(California|New York|Texas|Florida|Illinois|Pennsylvania|Ohio|Georgia|North Carolina|Michigan)\b/i
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let location = match[1].trim().replace(/,$/, '').toLowerCase();
      
      console.log('Extracted location candidate:', location);
      
      // Check our city mapping first
      if (CITY_STATE_MAP[location]) {
        console.log('Found in city mapping:', CITY_STATE_MAP[location]);
        return CITY_STATE_MAP[location];
      }
      
      // Handle state abbreviations from original match
      if (match[2]) {
        const state = match[2].length === 2 ? match[2].toUpperCase() : toTitleCase(match[2]);
        location = `${toTitleCase(match[1])}, ${state}`;
      } else {
        location = toTitleCase(match[1]);
      }
      
      if (location.length > 2) {
        return location;
      }
    }
  }

  return '';
};

const formatLocation = (location: string): string => {
  const normalized = location.toLowerCase().trim();
  
  // Check our enhanced city mapping first
  if (CITY_STATE_MAP[normalized]) {
    return CITY_STATE_MAP[normalized];
  }
  
  // Try to format as Title Case with proper comma placement
  const parts = location.split(/[,\s]+/).filter(p => p.length > 0);
  if (parts.length >= 2) {
    const city = parts.slice(0, -1).join(' ');
    const state = parts[parts.length - 1];
    return `${toTitleCase(city)}, ${state.length === 2 ? state.toUpperCase() : toTitleCase(state)}`;
  }
  
  return toTitleCase(location);
};

const getSuggestedSalary = (
  jobTitle: string,
  experienceLevel: ExperienceLevel,
  location: string,
  employmentType: EmploymentType
): string => {
  console.log('getSuggestedSalary called with:', { jobTitle, experienceLevel, location, employmentType });
  
  if (employmentType === 'project') return '';
  
  try {
    // Normalize job title for lookup
    const normalizedTitle = jobTitle.toLowerCase()
      .replace(/\b(senior|jr|junior|lead|principal|staff)\b/g, '')
      .trim();
    
    console.log('Normalized title:', normalizedTitle);
    
    // Find matching role in salary database
    let roleData = null;
    for (const [role, data] of Object.entries(SALARY_DATABASE.roles)) {
      if (normalizedTitle.includes(role) || role.includes(normalizedTitle)) {
        roleData = data;
        console.log('Found matching role:', role, data);
        break;
      }
    }
    
    // Default to software engineer if no match found
    if (!roleData) {
      roleData = SALARY_DATABASE.roles['software engineer'];
      console.log('Using software engineer fallback:', roleData);
    }
    
    // Get base salary range for experience level with enhanced safety checks
    let baseRange = roleData[experienceLevel];
    console.log('Base range for', experienceLevel, ':', baseRange);
    
    // Enhanced safety checks for baseRange
    if (!baseRange || !Array.isArray(baseRange) || baseRange.length < 2 || 
        typeof baseRange[0] !== 'number' || typeof baseRange[1] !== 'number') {
      console.log('Invalid baseRange, trying mid-level fallback');
      baseRange = roleData['mid-level'];
      
      // If mid-level also fails, use default ranges
      if (!baseRange || !Array.isArray(baseRange) || baseRange.length < 2) {
        console.log('Mid-level fallback failed, using default ranges');
        baseRange = DEFAULT_SALARY_RANGES[experienceLevel] || DEFAULT_SALARY_RANGES['mid-level'];
      }
    }
    
    console.log('Final baseRange:', baseRange);
    
    // Final validation - ensure we have a valid array with two numbers
    if (!Array.isArray(baseRange) || baseRange.length < 2 || 
        typeof baseRange[0] !== 'number' || typeof baseRange[1] !== 'number') {
      console.error('Invalid baseRange after all fallbacks:', baseRange);
      return '$80,000 - $120,000 per year'; // Emergency fallback
    }
    
    let [minSalary, maxSalary] = baseRange;
    
    // Apply location multiplier
    const normalizedLocation = location.toLowerCase();
    let locationMultiplier = 1.0;
    
    for (const [loc, multiplier] of Object.entries(SALARY_DATABASE.locations)) {
      if (normalizedLocation.includes(loc)) {
        locationMultiplier = multiplier;
        console.log('Found location multiplier:', loc, multiplier);
        break;
      }
    }
    
    // Apply adjustments and convert from thousands to actual amounts
    minSalary = Math.round(minSalary * locationMultiplier * 1000);
    maxSalary = Math.round(maxSalary * locationMultiplier * 1000);
    
    console.log('Final salary range:', { minSalary, maxSalary, locationMultiplier });
    
    // Format based on employment type
    if (employmentType === 'contract') {
      const hourlyMin = Math.round(minSalary / 2000); // Assuming 2000 hours per year
      const hourlyMax = Math.round(maxSalary / 2000);
      return `$${hourlyMin} - $${hourlyMax} per hour`;
    }
    
    return `$${minSalary.toLocaleString()} - $${maxSalary.toLocaleString()} per year`;
    
  } catch (error) {
    console.error('Error in getSuggestedSalary:', error);
    // Return a sensible default if anything fails
    return employmentType === 'contract' ? '$50 - $80 per hour' : '$80,000 - $120,000 per year';
  }
};

const getSuggestedBudget = (
  jobTitle: string,
  experienceLevel: ExperienceLevel,
  duration: string
): string => {
  try {
    // Get hourly rate based on role and experience
    const normalizedTitle = jobTitle.toLowerCase()
      .replace(/\b(senior|jr|junior|lead|principal|staff)\b/g, '')
      .trim();
    
    let roleData = null;
    for (const [role, data] of Object.entries(SALARY_DATABASE.roles)) {
      if (normalizedTitle.includes(role) || role.includes(normalizedTitle)) {
        roleData = data;
        break;
      }
    }
    
    if (!roleData) {
      roleData = SALARY_DATABASE.roles['software engineer'];
    }
    
    let baseRange = roleData[experienceLevel];
    if (!baseRange || !Array.isArray(baseRange) || baseRange.length < 2) {
      baseRange = roleData['mid-level'] || DEFAULT_SALARY_RANGES[experienceLevel] || DEFAULT_SALARY_RANGES['mid-level'];
    }
    
    const avgSalary = (baseRange[0] + baseRange[1]) / 2;
    const hourlyRate = Math.round(avgSalary / 2); // Convert from thousands to hourly
    
    // Estimate project budget based on duration
    const durationMatch = duration.match(/(\d+)\s*(month|week|day)/i);
    if (durationMatch) {
      const amount = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      
      let totalHours = 0;
      if (unit.includes('month')) {
        totalHours = amount * 160; // 40 hours/week * 4 weeks
      } else if (unit.includes('week')) {
        totalHours = amount * 40;
      } else if (unit.includes('day')) {
        totalHours = amount * 8;
      }
      
      if (totalHours > 0) {
        const totalBudget = Math.round(totalHours * hourlyRate);
        return `$${totalBudget.toLocaleString()} (${hourlyRate}/hr)`;
      }
    }
    
    return `$${hourlyRate - 20} - $${hourlyRate + 20} per hour`;
  } catch (error) {
    console.error('Error in getSuggestedBudget:', error);
    return '$50 - $80 per hour';
  }
};

const extractDuration = (text: string): string => {
  const patterns = [
    /(\d+[-–—]\d+)\s*(?:month|months|mo)\b/gi,
    /(\d+)\s*(?:month|months|mo)\b/gi,
    /(\d+[-–—]\d+)\s*(?:week|weeks|wk)\b/gi,
    /(\d+)\s*(?:week|weeks|wk)\b/gi,
    /(\d+[-–—]\d+)\s*(?:day|days)\b/gi,
    /(\d+)\s*(?:day|days)\b/gi
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const duration = match[1];
      if (pattern.source.includes('month')) {
        return duration.includes('-') ? `${duration} months` : `${duration} month${duration !== '1' ? 's' : ''}`;
      } else if (pattern.source.includes('week')) {
        return duration.includes('-') ? `${duration} weeks` : `${duration} week${duration !== '1' ? 's' : ''}`;
      } else if (pattern.source.includes('day')) {
        return duration.includes('-') ? `${duration} days` : `${duration} day${duration !== '1' ? 's' : ''}`;
      }
    }
  }

  return '';
};

const extractBenefits = (text: string): string => {
  const benefitKeywords = [
    'health insurance', 'dental', 'vision', 'medical',
    '401k', '401(k)', 'retirement', 'pension',
    'paid time off', 'pto', 'vacation', 'sick leave',
    'flexible schedule', 'remote work', 'work from home',
    'stock options', 'equity', 'bonus', 'profit sharing',
    'tuition reimbursement', 'education', 'training',
    'gym membership', 'wellness', 'mental health',
    'parental leave', 'maternity', 'paternity'
  ];

  const foundBenefits = new Set<string>();
  const lowerText = text.toLowerCase();

  benefitKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      foundBenefits.add(toTitleCase(keyword));
    }
  });

  return Array.from(foundBenefits).join(', ');
};

const normalizeEmploymentType = (text: string): EmploymentType => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('full') || lowerText.includes('full-time') || lowerText.includes('permanent')) {
    return 'full-time';
  }
  if (lowerText.includes('part') || lowerText.includes('part-time')) {
    return 'part-time';
  }
  if (lowerText.includes('contract') || lowerText.includes('contractor')) {
    return 'contract';
  }
  if (lowerText.includes('project') || lowerText.includes('freelance') || lowerText.includes('gig')) {
    return 'project';
  }
  
  return 'full-time';
};

const normalizeExperienceLevel = (text: string): ExperienceLevel => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('entry') || lowerText.includes('junior') || lowerText.includes('beginner') || lowerText.includes('graduate')) {
    return 'entry-level';
  }
  if (lowerText.includes('senior') || lowerText.includes('lead') || lowerText.includes('principal') || lowerText.includes('staff')) {
    return 'senior-level';
  }
  if (lowerText.includes('executive') || lowerText.includes('director') || lowerText.includes('vp') || lowerText.includes('head of') || lowerText.includes('chief')) {
    return 'executive';
  }
  
  return 'mid-level';
};

const normalizeLocationType = (text: string): LocationType => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('remote') || lowerText.includes('work from home') || lowerText.includes('distributed')) {
    return 'remote';
  }
  if (lowerText.includes('hybrid') || lowerText.includes('flexible')) {
    return 'hybrid';
  }
  if (lowerText.includes('office') || lowerText.includes('on-site') || lowerText.includes('onsite') || lowerText.includes('in-person')) {
    return 'office';
  }
  
  return 'remote';
};

export const enhancedAutoPopulateFromOverview = (
  overview: string,
  websiteData: CompanyAnalysisData | null,
  currentFormData: UnifiedJobFormData
): Partial<UnifiedJobFormData> => {
  console.log('=== ENHANCED AUTO-POPULATION WITH INTELLIGENT SUGGESTIONS ===');
  console.log('Overview:', overview);
  console.log('Website data:', websiteData);
  
  const updates: Partial<UnifiedJobFormData> = {};
  
  // 1. Enhanced job title extraction
  if (!currentFormData.title?.trim()) {
    const titlePatterns = [
      // "Senior react developer at..."
      /^([^,\n.]+?)(?:\s+(?:at|for|with|in)\s)/i,
      // "Looking for a Senior Developer"
      /(?:looking for|seeking|hiring|need)\s+(?:a\s+)?([^,\n.]+?)(?:\s+(?:for|at|with|in|position|role)|$)/i,
      // "Position: Developer"
      /(?:position|role|job):\s*([^,\n.]+)/i,
      // First meaningful phrase before contextual words
      /^([a-zA-Z\s]+?)(?:\s+(?:at|for|with|in|position|role|job))/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = overview.match(pattern);
      if (match && match[1]) {
        const rawTitle = match[1].trim();
        if (rawTitle.length > 2 && !['the', 'a', 'an', 'we', 'our', 'i', 'am', 'looking'].includes(rawTitle.toLowerCase())) {
          updates.title = formatJobTitle(rawTitle);
          console.log('Extracted title:', updates.title);
          break;
        }
      }
    }
  }
  
  // 2. Company name from website data
  if (!currentFormData.companyName?.trim() && websiteData?.companyName) {
    updates.companyName = websiteData.companyName;
  }
  
  // 3. Enhanced location extraction with better city mapping
  if (!currentFormData.location?.trim()) {
    if (websiteData?.location) {
      updates.location = formatLocation(websiteData.location);
    } else {
      const extractedLocation = extractLocation(overview);
      if (extractedLocation) {
        updates.location = extractedLocation;
        console.log('Extracted location:', extractedLocation);
      }
    }
  }
  
  // 4. Enhanced skills extraction with related skills and deduplication
  if (!currentFormData.skills?.trim()) {
    const jobTitle = updates.title || currentFormData.title;
    let extractedSkills = extractSkills(overview, jobTitle);
    
    if (websiteData?.technologies && websiteData.technologies.length > 0) {
      const websiteSkills = websiteData.technologies.join(', ');
      extractedSkills = extractedSkills ? `${extractedSkills}, ${websiteSkills}` : websiteSkills;
    }
    
    if (extractedSkills) {
      // Final deduplication pass
      const skillsArray = extractedSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const uniqueSkills = new Set<string>();
      const lowerSkills = new Set<string>();
      
      skillsArray.forEach(skill => {
        const lowerSkill = skill.toLowerCase();
        if (!lowerSkills.has(lowerSkill)) {
          lowerSkills.add(lowerSkill);
          uniqueSkills.add(skill);
        }
      });
      
      updates.skills = Array.from(uniqueSkills).join(', ');
      console.log('Final skills:', updates.skills);
    }
  }
  
  // 5. Employment type detection
  const detectedEmploymentType = normalizeEmploymentType(overview);
  if (detectedEmploymentType !== 'full-time') {
    updates.employmentType = detectedEmploymentType;
  }
  
  // 6. Experience level detection
  const detectedExperienceLevel = normalizeExperienceLevel(overview);
  if (detectedExperienceLevel !== 'mid-level') {
    updates.experienceLevel = detectedExperienceLevel;
  }
  
  // 7. Location type detection
  const detectedLocationType = normalizeLocationType(overview);
  if (detectedLocationType !== 'remote') {
    updates.locationType = detectedLocationType;
  }
  
  // 8. Intelligent salary/budget suggestions with proper formatting
  const finalEmploymentType = updates.employmentType || currentFormData.employmentType;
  const finalExperienceLevel = updates.experienceLevel || currentFormData.experienceLevel;
  const finalJobTitle = updates.title || currentFormData.title;
  const finalLocation = updates.location || currentFormData.location;
  
  if (finalEmploymentType === 'project') {
    // Handle project budget
    if (!currentFormData.budget?.trim()) {
      const extractedBudget = extractSalaryOrBudget(overview, true);
      if (extractedBudget) {
        updates.budget = extractedBudget;
      } else if (finalJobTitle) {
        // Suggest budget based on role and duration
        const extractedDuration = extractDuration(overview);
        const suggestedBudget = getSuggestedBudget(finalJobTitle, finalExperienceLevel, extractedDuration || '3 months');
        updates.budget = suggestedBudget;
      }
    }
    
    // Duration for projects
    if (!currentFormData.duration?.trim()) {
      const extractedDuration = extractDuration(overview);
      if (extractedDuration) {
        updates.duration = extractedDuration;
      }
    }
  } else {
    // Handle full-time/part-time/contract salary with proper formatting
    if (!currentFormData.salary?.trim()) {
      const extractedSalary = extractSalaryOrBudget(overview, false);
      if (extractedSalary) {
        updates.salary = extractedSalary;
      } else if (finalJobTitle && finalLocation) {
        // Intelligent salary suggestion based on market data
        const suggestedSalary = getSuggestedSalary(finalJobTitle, finalExperienceLevel, finalLocation, finalEmploymentType);
        updates.salary = suggestedSalary;
        console.log('Suggested salary:', suggestedSalary);
      }
    }
  }
  
  // 9. Benefits extraction for non-project roles
  if (finalEmploymentType !== 'project' && !currentFormData.benefits?.trim()) {
    let extractedBenefits = extractBenefits(overview);
    
    if (websiteData?.benefits && websiteData.benefits.length > 0) {
      const websiteBenefits = websiteData.benefits.join(', ');
      extractedBenefits = extractedBenefits ? `${extractedBenefits}, ${websiteBenefits}` : websiteBenefits;
    }
    
    if (extractedBenefits) {
      updates.benefits = extractedBenefits;
    }
  }
  
  console.log('=== ENHANCED AUTO-POPULATION COMPLETE ===');
  console.log('Final updates:', updates);
  
  return updates;
};

// Helper function for salary/budget extraction (simplified version of the enhanced logic)
const extractSalaryOrBudget = (text: string, isProject: boolean): string => {
  const patterns = [
    /\$\s*(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*[-–—to]\s*\$?\s*(\d{1,3}(?:,\d{3})*(?:k|K)?)/g,
    /\$\s*(\d{1,3}(?:,\d{3})*(?:k|K)?)/g,
    /\$\s*(\d{1,3})\s*(?:\/hr|per hour|hourly)/gi,
    /(?:\$\s*)?(\d{1,3}k?)\s*[-–—to]\s*(?:\$\s*)?(\d{1,3}k?)/g
  ];

  for (const pattern of patterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      const match = matches[0];
      if (match[2]) {
        return `$${match[1]} - $${match[2]}`;
      } else {
        const amount = match[1];
        return isProject ? `$${amount}` : `$${amount} per year`;
      }
    }
  }

  return '';
};
