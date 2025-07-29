
import { UnifiedJobFormData, CompanyAnalysisData } from "@/types/jobForm";
import { useAIJobParsing, AIJobData } from "@/hooks/useAIJobParsing";

type EmploymentType = "full-time" | "part-time" | "contract" | "project";
type ExperienceLevel = "entry-level" | "mid-level" | "senior-level" | "executive";
type LocationType = "remote" | "office" | "hybrid";

// Executive roles database for intelligent detection
const EXECUTIVE_ROLES = {
  'ceo': { title: 'CEO', fullTitle: 'Chief Executive Officer' },
  'chief executive officer': { title: 'CEO', fullTitle: 'Chief Executive Officer' },
  'cto': { title: 'CTO', fullTitle: 'Chief Technology Officer' },
  'chief technology officer': { title: 'CTO', fullTitle: 'Chief Technology Officer' },
  'coo': { title: 'COO', fullTitle: 'Chief Operating Officer' },
  'chief operating officer': { title: 'COO', fullTitle: 'Chief Operating Officer' },
  'cfo': { title: 'CFO', fullTitle: 'Chief Financial Officer' },
  'chief financial officer': { title: 'CFO', fullTitle: 'Chief Financial Officer' },
  'cmo': { title: 'CMO', fullTitle: 'Chief Marketing Officer' },
  'chief marketing officer': { title: 'CMO', fullTitle: 'Chief Marketing Officer' },
  'president': { title: 'President', fullTitle: 'President' },
  'vice president': { title: 'Vice President', fullTitle: 'Vice President' },
  'vp': { title: 'VP', fullTitle: 'Vice President' },
  'director': { title: 'Director', fullTitle: 'Director' },
  'managing director': { title: 'Managing Director', fullTitle: 'Managing Director' },
  'general manager': { title: 'General Manager', fullTitle: 'General Manager' }
};

// Enhanced salary database with executive compensation
const ENHANCED_SALARY_DATABASE = {
  // Executive roles with higher compensation ranges
  executive: {
    'ceo': { 'startup': [150, 300], 'small': [200, 400], 'medium': [300, 600], 'large': [500, 1200] },
    'cto': { 'startup': [140, 280], 'small': [180, 350], 'medium': [250, 500], 'large': [400, 800] },
    'coo': { 'startup': [130, 270], 'small': [170, 340], 'medium': [240, 480], 'large': [380, 750] },
    'cfo': { 'startup': [130, 270], 'small': [170, 340], 'medium': [240, 480], 'large': [380, 750] },
    'cmo': { 'startup': [120, 250], 'small': [160, 320], 'medium': [220, 440], 'large': [350, 700] },
    'director': { 'startup': [100, 200], 'small': [130, 260], 'medium': [180, 360], 'large': [280, 550] },
    'vp': { 'startup': [110, 220], 'small': [140, 280], 'medium': [200, 400], 'large': [320, 640] }
  },
  // Regular roles
  regular: {
    'developer': { 'entry-level': [70, 95], 'mid-level': [95, 130], 'senior-level': [130, 180] },
    'designer': { 'entry-level': [60, 85], 'mid-level': [85, 115], 'senior-level': [115, 155] },
    'manager': { 'entry-level': [80, 110], 'mid-level': [110, 150], 'senior-level': [150, 200] },
    'analyst': { 'entry-level': [55, 80], 'mid-level': [80, 110], 'senior-level': [110, 150] },
    'specialist': { 'entry-level': [50, 75], 'mid-level': [75, 105], 'senior-level': [105, 140] }
  }
};

// Executive skills and benefits
const EXECUTIVE_CONTEXT = {
  skills: [
    'Strategic Planning', 'Leadership', 'Business Development', 'Team Management',
    'Financial Planning', 'Operations Management', 'Stakeholder Management',
    'Strategic Vision', 'Executive Leadership', 'P&L Management'
  ],
  benefits: [
    'Executive compensation package', 'Equity/Stock options', 'Performance bonuses',
    'Health insurance', 'Retirement plans', 'Executive perks', 'Flexible schedule',
    'Professional development', 'Leadership coaching'
  ]
};

// Capitalize company name properly
const capitalizeCompanyName = (companyName: string): string => {
  return companyName
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Keep common business words lowercase unless at start
      const lowercaseWords = ['and', 'or', 'of', 'the', 'for', 'in', 'on', 'at', 'to', 'a', 'an'];
      if (lowercaseWords.includes(word)) {
        return word;
      }
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    // Always capitalize first word
    .replace(/^[a-z]/, match => match.toUpperCase());
};

// Smart company name extraction with priority logic
const extractCompanyName = (overview: string, websiteData: CompanyAnalysisData | null): string => {
  console.log('=== SMART COMPANY NAME EXTRACTION ===');
  
  // Priority 1: Extract from user overview using intelligent patterns
  const companyPatterns = [
    // "at [Company Name]" or "for [Company Name]"
    /(?:at|for|with)\s+([A-Z][a-zA-Z\s&.,-]+?)(?:\s+(?:called|named|known)|$|[,.]|\s+(?:we|I|they|that|which))/i,
    // "called [Company Name]" or "named [Company Name]"
    /(?:called|named|known as)\s+([A-Z][a-zA-Z\s&.,-]+?)(?:$|[,.]|\s+(?:we|I|they|that|which))/i,
    // "[Company Name] is looking" or "[Company Name] needs"
    /^([A-Z][a-zA-Z\s&.,-]+?)\s+(?:is|needs|wants|seeks)/i,
    // "company [Company Name]" or "business [Company Name]"
    /(?:company|business|organization|startup|agency|firm)\s+([A-Z][a-zA-Z\s&.,-]+?)(?:$|[,.]|\s+(?:is|needs|wants))/i
  ];

  for (const pattern of companyPatterns) {
    const match = overview.match(pattern);
    if (match && match[1]) {
      const rawCompanyName = match[1].trim().replace(/[,.]$/, '');
      if (rawCompanyName.length > 1 && !['Inc', 'LLC', 'Corp', 'Ltd'].includes(rawCompanyName)) {
        const capitalizedName = capitalizeCompanyName(rawCompanyName);
        console.log('Extracted company from overview:', capitalizedName);
        return capitalizedName;
      }
    }
  }

  // Priority 2: Use website analysis data if available and makes sense
  if (websiteData?.companyName && websiteData.companyName.length > 2) {
    const capitalizedName = capitalizeCompanyName(websiteData.companyName);
    console.log('Using website company name:', capitalizedName);
    return capitalizedName;
  }

  console.log('No company name extracted');
  return '';
};

// Smart location extraction with proper formatting
const extractLocation = (overview: string): string => {
  console.log('=== SMART LOCATION EXTRACTION ===');
  
  // US state abbreviations
  const stateAbbreviations = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ].join('|');
  
  const countries = 'australia|usa|uk|canada|germany|france|italy|spain|netherlands|sweden|norway|denmark|finland|switzerland|austria|belgium|ireland|new zealand|singapore|japan|south korea|india|brazil|mexico|argentina|chile|peru|colombia|venezuela|ecuador|bolivia|uruguay|paraguay|guyana|suriname|french guiana';
  
  // Common major US cities that don't need state clarification
  const majorCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs', 'Raleigh', 'Miami', 'Virginia Beach', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans', 'Wichita', 'Cleveland', 'Bakersfield', 'Aurora', 'Anaheim', 'Honolulu', 'Santa Ana', 'Corpus Christi', 'Riverside', 'Lexington', 'Stockton', 'Henderson', 'Saint Paul', 'St. Louis', 'Cincinnati', 'Pittsburgh', 'Greensboro', 'Anchorage', 'Plano', 'Lincoln', 'Orlando', 'Irvine', 'Newark', 'Toledo', 'Durham', 'Chula Vista', 'Fort Wayne', 'Jersey City', 'St. Petersburg', 'Laredo', 'Madison', 'Chandler', 'Buffalo', 'Lubbock', 'Scottsdale', 'Reno', 'Glendale', 'Gilbert', 'Winston Salem', 'North Las Vegas', 'Norfolk', 'Chesapeake', 'Garland', 'Irving', 'Hialeah', 'Fremont', 'Baton Rouge', 'Richmond', 'Boise', 'San Bernardino'];
  const majorCitiesPattern = majorCities.join('|');
  
  // Location patterns to match various formats
  const locationPatterns = [
    // "[City] [State Abbrev] based" pattern - more precise to avoid job titles
    new RegExp(`\\b([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)\\s+(${stateAbbreviations})\\s+based\\b`, 'i'),
    // "[City], [State Abbrev]" pattern
    new RegExp(`\\b([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*),\\s+(${stateAbbreviations})\\b`, 'i'),
    // "[City] [State Abbrev]" pattern (no comma) - more precise
    new RegExp(`\\b([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)\\s+(${stateAbbreviations})\\b(?!\\s+based)`, 'i'),
    // "[Major City] based" pattern without state requirement - NEW
    new RegExp(`\\b(${majorCitiesPattern})\\s+based\\b`, 'i'),
    // "in [City, Country]" or "in [City]"
    new RegExp(`\\bin\\s+([A-Z][a-zA-Z\\s,.-]+?)(?:\\s+(?:${countries}))\\b`, 'i'),
    // "located in [Location]"
    /located\s+in\s+([A-Z][a-zA-Z\s,.-]+?)(?:\s|$|[,.])/i,
    // "based in [Location]"
    /based\s+in\s+([A-Z][a-zA-Z\s,.-]+?)(?:\s|$|[,.])/i,
    // "[City], [Country]" pattern
    new RegExp(`\\b([A-Z][a-zA-Z\\s]+),\\s*(${countries})\\b`, 'i'),
    // Simple "in [City] [Country]" pattern
    new RegExp(`\\bin\\s+([a-zA-Z\\s]+)\\s+(${countries})\\b`, 'i')
  ];

  for (const pattern of locationPatterns) {
    const match = overview.match(pattern);
    if (match) {
      let location = '';
      
      if (pattern.source.includes('([a-zA-Z\\s]+)\\s+(australia')) {
        // Pattern 5: "in melbourne australia"
        const city = match[1].trim();
        const country = match[2].trim();
        location = `${capitalizeLocation(city)}, ${capitalizeLocation(country)}`;
      } else if (match[2]) {
        // Pattern 4: "melbourne, australia"
        const city = match[1].trim();
        const country = match[2].trim();
        location = `${capitalizeLocation(city)}, ${capitalizeLocation(country)}`;
      } else if (match[1]) {
        // Other patterns
        location = capitalizeLocation(match[1].trim().replace(/[,.]$/, ''));
      }
      
      if (location && location.length > 2) {
        console.log('Extracted location:', location);
        return location;
      }
    }
  }

  console.log('No location extracted');
  return '';
};

// Capitalize location properly
const capitalizeLocation = (location: string): string => {
  return location
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Smart job title extraction with executive role detection
const extractJobTitle = (overview: string): { title: string; isExecutive: boolean } => {
  console.log('=== SMART JOB TITLE EXTRACTION ===');
  
  // Executive role patterns with context
  const executivePatterns = [
    // "CEO of", "CTO at", etc.
    /(CEO|CTO|COO|CFO|CMO|Chief Executive Officer|Chief Technology Officer|Chief Operating Officer|Chief Financial Officer|Chief Marketing Officer)\s+(?:of|at|for)/i,
    // "President of", "Director of", etc.
    /(President|Vice President|VP|Director|Managing Director|General Manager)\s+(?:of|at|for)/i,
    // "Looking for a CEO", "Hiring a CTO", etc.
    /(?:looking for|hiring|seeking|need)\s+(?:a|an)?\s*(CEO|CTO|COO|CFO|CMO|President|Vice President|VP|Director|Managing Director|General Manager)/i,
    // "CEO position", "CTO role", etc.
    /(CEO|CTO|COO|CFO|CMO|President|Vice President|VP|Director|Managing Director|General Manager)\s+(?:position|role|job)/i
  ];

  for (const pattern of executivePatterns) {
    const match = overview.match(pattern);
    if (match && match[1]) {
      const role = match[1].toLowerCase().trim();
      const executiveInfo = EXECUTIVE_ROLES[role];
      if (executiveInfo) {
        console.log('Extracted executive title:', executiveInfo.title);
        return { title: executiveInfo.title, isExecutive: true };
      }
    }
  }

  // Regular job title patterns
  const regularPatterns = [
    // "Senior Developer at", "Marketing Manager for", etc.
    /^([A-Z][a-zA-Z\s]+?)\s+(?:at|for|with)/i,
    // "Looking for a Senior Developer"
    /(?:looking for|hiring|seeking|need)\s+(?:a|an)?\s*([A-Z][a-zA-Z\s]+?)(?:\s+(?:at|for|with|position|role)|$)/i,
    // "Position: Developer", "Role: Manager"
    /(?:position|role|job):\s*([A-Z][a-zA-Z\s]+)/i
  ];

  for (const pattern of regularPatterns) {
    const match = overview.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim();
      if (title.length > 2 && !['the', 'a', 'an', 'we', 'our'].includes(title.toLowerCase())) {
        console.log('Extracted regular title:', title);
        return { title, isExecutive: false };
      }
    }
  }

  console.log('No job title extracted');
  return { title: '', isExecutive: false };
};

// Intelligent salary suggestion based on role context
const getIntelligentSalary = (
  title: string,
  isExecutive: boolean,
  experienceLevel: ExperienceLevel,
  location: string,
  employmentType: EmploymentType,
  websiteData: CompanyAnalysisData | null
): string => {
  console.log('=== INTELLIGENT SALARY CALCULATION ===');
  
  if (employmentType === 'project') return '';

  try {
    let salaryRange: [number, number] = [80, 120]; // Default fallback

    if (isExecutive) {
      // Executive compensation logic
      const roleKey = title.toLowerCase().replace(/[^a-z]/g, '');
      const companySize = determineCompanySize(websiteData);
      
      const executiveRoleData = ENHANCED_SALARY_DATABASE.executive[roleKey as keyof typeof ENHANCED_SALARY_DATABASE.executive];
      if (executiveRoleData) {
        const rangeTuple = executiveRoleData[companySize as keyof typeof executiveRoleData];
        if (rangeTuple && Array.isArray(rangeTuple) && rangeTuple.length >= 2) {
          salaryRange = [rangeTuple[0], rangeTuple[1]];
        }
      } else {
        // Default executive range based on company size
        const executiveDefaults: Record<string, [number, number]> = {
          'startup': [120, 250],
          'small': [150, 300],
          'medium': [200, 400],
          'large': [300, 600]
        };
        salaryRange = executiveDefaults[companySize] || [150, 300];
      }
    } else {
      // Regular role compensation
      const roleType = determineRoleType(title);
      const roleMap = ENHANCED_SALARY_DATABASE.regular[roleType as keyof typeof ENHANCED_SALARY_DATABASE.regular];
      
      if (roleMap && roleMap[experienceLevel]) {
        const rangeTuple = roleMap[experienceLevel];
        if (Array.isArray(rangeTuple) && rangeTuple.length >= 2) {
          salaryRange = [rangeTuple[0], rangeTuple[1]];
        }
      }
    }

    // Apply location multiplier
    const locationMultiplier = getLocationMultiplier(location);
    const [minSalary, maxSalary] = salaryRange.map(amount => Math.round(amount * locationMultiplier * 1000));

    const formattedSalary = employmentType === 'contract' 
      ? `$${Math.round(minSalary / 2000)} - $${Math.round(maxSalary / 2000)} per hour`
      : `$${minSalary.toLocaleString()} - $${maxSalary.toLocaleString()} per year`;

    console.log('Calculated salary:', formattedSalary);
    return formattedSalary;

  } catch (error) {
    console.error('Error calculating salary:', error);
    return employmentType === 'contract' ? '$50 - $80 per hour' : '$80,000 - $120,000 per year';
  }
};

// Helper functions
const determineCompanySize = (websiteData: CompanyAnalysisData | null): string => {
  if (websiteData?.companySize) {
    const size = websiteData.companySize.toLowerCase();
    if (size.includes('startup') || size.includes('small')) return 'startup';
    if (size.includes('medium')) return 'medium';
    if (size.includes('large') || size.includes('enterprise')) return 'large';
  }
  return 'small'; // Default
};

const determineRoleType = (title: string): string => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('develop') || titleLower.includes('engineer')) return 'developer';
  if (titleLower.includes('design')) return 'designer';
  if (titleLower.includes('manage') || titleLower.includes('lead')) return 'manager';
  if (titleLower.includes('analy')) return 'analyst';
  return 'specialist';
};

const getLocationMultiplier = (location: string): number => {
  const locationMap = {
    'san francisco': 1.4, 'new york': 1.3, 'los angeles': 1.2, 'seattle': 1.25,
    'boston': 1.2, 'washington': 1.15, 'chicago': 1.1, 'austin': 1.05,
    'remote': 0.95, 'worldwide': 0.9
  };
  
  const locationLower = location.toLowerCase();
  for (const [key, multiplier] of Object.entries(locationMap)) {
    if (locationLower.includes(key)) return multiplier;
  }
  return 1.0;
};

// Smart skills extraction for executives
const getExecutiveSkills = (title: string, websiteData: CompanyAnalysisData | null): string => {
  let skills = [...EXECUTIVE_CONTEXT.skills];
  
  // Add industry-specific executive skills
  if (websiteData?.industry) {
    const industry = websiteData.industry.toLowerCase();
    if (industry.includes('tech')) {
      skills.push('Technology Strategy', 'Digital Transformation', 'Product Vision');
    } else if (industry.includes('marketing')) {
      skills.push('Brand Strategy', 'Marketing Strategy', 'Customer Acquisition');
    } else if (industry.includes('finance')) {
      skills.push('Financial Strategy', 'Risk Management', 'Investment Strategy');
    }
  }

  // Add role-specific skills
  const titleLower = title.toLowerCase();
  if (titleLower.includes('cto') || titleLower.includes('technology')) {
    skills.push('Technical Leadership', 'Engineering Management', 'Technology Roadmap');
  } else if (titleLower.includes('cmo') || titleLower.includes('marketing')) {
    skills.push('Marketing Strategy', 'Brand Management', 'Growth Marketing');
  }

  return skills.slice(0, 8).join(', '); // Limit to 8 most relevant skills
};

// Create AI-powered auto-population function (with regex fallback)
export const createAIAutoPopulateFunction = () => {
  const { parseJobOverview } = useAIJobParsing();
  
  return async (
    overview: string,
    websiteData: CompanyAnalysisData | null,
    currentFormData: UnifiedJobFormData
  ): Promise<Partial<UnifiedJobFormData>> => {
    console.log('=== AI-POWERED AUTO-POPULATION ===');
    console.log('Overview:', overview);
    console.log('Website data:', websiteData ? 'Available' : 'None');

    const updates: Partial<UnifiedJobFormData> = {};

    // Try AI parsing first
    const aiData = await parseJobOverview(overview);
    
    if (aiData) {
      console.log('AI parsed data:', aiData);
      
      // Apply AI-extracted data to form fields (only if current field is empty)
      if (!currentFormData.companyName?.trim() && aiData.companyName) {
        updates.companyName = aiData.companyName;
      }
      
      if (!currentFormData.title?.trim() && aiData.jobTitle) {
        updates.title = aiData.jobTitle;
      }
      
      if (!currentFormData.location?.trim() && aiData.location) {
        updates.location = aiData.location;
      }
      
      if (!currentFormData.experienceLevel?.trim() && aiData.experienceLevel) {
        updates.experienceLevel = aiData.experienceLevel as ExperienceLevel;
      }
      
      if (!currentFormData.employmentType?.trim() && aiData.employmentType) {
        updates.employmentType = aiData.employmentType as EmploymentType;
      }
      
      if (!currentFormData.locationType?.trim() && aiData.workLocation) {
        updates.locationType = aiData.workLocation as LocationType;
      }
      
      // Executive role handling
      if (aiData.isExecutiveRole) {
        console.log('AI detected executive role - applying executive defaults');
        updates.experienceLevel = 'executive';
        updates.employmentType = 'full-time';
        updates.locationType = updates.locationType || 'hybrid';
        
        if (!currentFormData.skills?.trim()) {
          updates.skills = getExecutiveSkills(aiData.jobTitle || '', websiteData);
        }
        
        if (!currentFormData.benefits?.trim()) {
          updates.benefits = EXECUTIVE_CONTEXT.benefits.join(', ');
        }
      }
      
      // Intelligent salary calculation based on AI data
      const finalTitle = updates.title || currentFormData.title || aiData.jobTitle;
      const finalExperienceLevel = updates.experienceLevel || currentFormData.experienceLevel;
      const finalEmploymentType = updates.employmentType || currentFormData.employmentType;
      const finalLocation = updates.location || currentFormData.location || 'Remote';
      
      if (finalTitle && finalEmploymentType !== 'project' && !currentFormData.salary?.trim()) {
        const intelligentSalary = getIntelligentSalary(
          finalTitle,
          aiData.isExecutiveRole,
          finalExperienceLevel,
          finalLocation,
          finalEmploymentType,
          websiteData
        );
        if (intelligentSalary) {
          updates.salary = intelligentSalary;
        }
      }
      
      console.log('=== AI AUTO-POPULATION COMPLETE ===');
      console.log('Applied updates:', Object.keys(updates));
      return updates;
    }
    
    // Fallback to existing regex-based logic
    console.log('AI parsing failed, falling back to regex-based extraction');
    return enhancedAutoPopulateFromOverview(overview, websiteData, currentFormData);
  };
};

// Enhanced auto-population main function (fallback for when AI fails)
export const enhancedAutoPopulateFromOverview = (
  overview: string,
  websiteData: CompanyAnalysisData | null,
  currentFormData: UnifiedJobFormData
): Partial<UnifiedJobFormData> => {
  console.log('=== ENHANCED INTELLIGENT AUTO-POPULATION (REGEX FALLBACK) ===');
  console.log('Overview:', overview);
  console.log('Website data:', websiteData ? 'Available' : 'None');

  const updates: Partial<UnifiedJobFormData> = {};

  // 1. Smart company name extraction (user input priority)
  if (!currentFormData.companyName?.trim()) {
    const extractedCompany = extractCompanyName(overview, websiteData);
    if (extractedCompany) {
      updates.companyName = extractedCompany;
    }
  }

  // 2. Intelligent job title extraction with executive detection
  if (!currentFormData.title?.trim()) {
    const { title, isExecutive } = extractJobTitle(overview);
    if (title) {
      updates.title = title;

      // 3. Auto-configure for executive roles
      if (isExecutive) {
        console.log('Executive role detected - applying executive defaults');
        updates.employmentType = 'full-time';
        updates.experienceLevel = 'executive';
        updates.locationType = updates.locationType || 'hybrid'; // Executives often have flexibility

        // Executive-specific skills
        updates.skills = getExecutiveSkills(title, websiteData);

        // Executive benefits
        updates.benefits = EXECUTIVE_CONTEXT.benefits.join(', ');
      }
    }
  }

  // 3. Smart location extraction
  if (!currentFormData.location?.trim()) {
    const extractedLocation = extractLocation(overview);
    if (extractedLocation) {
      updates.location = extractedLocation;
    }
  }

  // 4. Intelligent salary calculation
  const finalTitle = updates.title || currentFormData.title;
  const finalExperienceLevel = updates.experienceLevel || currentFormData.experienceLevel;
  const finalEmploymentType = updates.employmentType || currentFormData.employmentType;
  const finalLocation = updates.location || currentFormData.location || 'Remote';
  const isExecutiveRole = updates.experienceLevel === 'executive' || finalExperienceLevel === 'executive';

  if (finalTitle && finalEmploymentType !== 'project' && !currentFormData.salary?.trim()) {
    const intelligentSalary = getIntelligentSalary(
      finalTitle,
      isExecutiveRole,
      finalExperienceLevel,
      finalLocation,
      finalEmploymentType,
      websiteData
    );
    if (intelligentSalary) {
      updates.salary = intelligentSalary;
    }
  }

  // 5. Smart location and work arrangement defaults
  if (!currentFormData.locationType?.trim()) {
    updates.locationType = isExecutiveRole ? 'hybrid' : 'remote';
  }

  // 6. Only use website data for supplementary information, not overriding user context
  if (websiteData && !isExecutiveRole) {
    // Add website technologies to skills if not already populated
    if (!updates.skills && !currentFormData.skills?.trim() && websiteData.technologies?.length > 0) {
      updates.skills = websiteData.technologies.slice(0, 6).join(', ');
    }
  }

  console.log('=== INTELLIGENT AUTO-POPULATION COMPLETE ===');
  console.log('Applied updates:', Object.keys(updates));
  console.log('Executive role detected:', isExecutiveRole);

  return updates;
};
