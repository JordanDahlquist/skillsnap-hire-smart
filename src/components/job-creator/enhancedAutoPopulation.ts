import { UnifiedJobFormData, CompanyAnalysisData } from "@/types/jobForm";

type EmploymentType = "full-time" | "part-time" | "contract" | "project";
type ExperienceLevel = "entry-level" | "mid-level" | "senior-level" | "executive";
type LocationType = "remote" | "office" | "hybrid";

// Enhanced text processing utilities
const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Escape special regex characters
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const formatJobTitle = (title: string): string => {
  // Common job title patterns that should maintain specific casing
  const specialCases = {
    'ui': 'UI',
    'ux': 'UX',
    'api': 'API',
    'cto': 'CTO',
    'ceo': 'CEO',
    'cfo': 'CFO',
    'vp': 'VP',
    'ai': 'AI',
    'ml': 'ML',
    'ios': 'iOS',
    'android': 'Android',
    'react': 'React',
    'vue': 'Vue',
    'angular': 'Angular',
    'node': 'Node',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'c#': 'C#',
    'c++': 'C++',
    'php': 'PHP',
    'sql': 'SQL',
    'aws': 'AWS',
    'gcp': 'GCP',
    'devops': 'DevOps',
    'qa': 'QA'
  };

  let formatted = toTitleCase(title.trim());
  
  // Apply special casing with proper regex escaping
  Object.entries(specialCases).forEach(([key, value]) => {
    const escapedKey = escapeRegex(key);
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'gi');
    formatted = formatted.replace(regex, value);
  });
  
  return formatted;
};

const extractSkills = (text: string): string => {
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
  
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => skills.add(match));
    }
  });

  return Array.from(skills).join(', ');
};

const extractSalaryOrBudget = (text: string, isProject: boolean): string => {
  const patterns = [
    // Salary ranges: $80k-$120k, $80,000-$120,000
    /\$\s*(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*[-–—to]\s*\$?\s*(\d{1,3}(?:,\d{3})*(?:k|K)?)/g,
    // Single amounts: $100k, $100,000
    /\$\s*(\d{1,3}(?:,\d{3})*(?:k|K)?)/g,
    // Hourly rates: $50/hr, $50 per hour
    /\$\s*(\d{1,3})\s*(?:\/hr|per hour|hourly)/gi,
    // Budget ranges: 5k-10k, $5k-$10k
    /(?:\$\s*)?(\d{1,3}k?)\s*[-–—to]\s*(?:\$\s*)?(\d{1,3}k?)/g
  ];

  for (const pattern of patterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      const match = matches[0];
      if (match[2]) {
        // Range found
        return `$${match[1]} - $${match[2]}`;
      } else {
        // Single amount
        const amount = match[1];
        return isProject ? `$${amount}` : `$${amount} per year`;
      }
    }
  }

  return '';
};

const extractDuration = (text: string): string => {
  const patterns = [
    /(\d+)\s*(?:month|months|mo)\b/gi,
    /(\d+)\s*(?:week|weeks|wk)\b/gi,
    /(\d+)\s*(?:day|days)\b/gi,
    /(\d+[-–—]\d+)\s*(?:month|months|mo)\b/gi,
    /(\d+[-–—]\d+)\s*(?:week|weeks|wk)\b/gi
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
  console.log('=== ENHANCED AUTO-POPULATION STARTED ===');
  console.log('Overview:', overview);
  console.log('Website data:', websiteData);
  
  const updates: Partial<UnifiedJobFormData> = {};
  
  // 1. Extract and format job title
  if (!currentFormData.title?.trim()) {
    const titlePatterns = [
      /(?:looking for|seeking|hiring|need)\s+(?:a\s+)?([^,\n.]+?)(?:\s+(?:for|at|with|in|position|role)|$)/i,
      /^([^,\n.]+?)(?:\s+(?:for|at|with|in)\s)/i,
      /(?:position|role|job):\s*([^,\n.]+)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = overview.match(pattern);
      if (match && match[1]) {
        const rawTitle = match[1].trim();
        if (rawTitle.length > 2 && !['the', 'a', 'an', 'we', 'our'].includes(rawTitle.toLowerCase())) {
          updates.title = formatJobTitle(rawTitle);
          break;
        }
      }
    }
  }
  
  // 2. Company name from website data (priority) or text extraction
  if (!currentFormData.companyName?.trim()) {
    if (websiteData?.companyName) {
      updates.companyName = websiteData.companyName;
    }
  }
  
  // 3. Location extraction and formatting
  if (!currentFormData.location?.trim()) {
    if (websiteData?.location) {
      updates.location = toTitleCase(websiteData.location);
    } else {
      const locationPatterns = [
        /\bin\s+([A-Z][a-zA-Z\s,]+?)(?:\s|$|,|\.|!|\?)/,
        /(?:based|located)\s+in\s+([A-Z][a-zA-Z\s,]+?)(?:\s|$|,|\.|!|\?)/i,
        /([A-Z][a-zA-Z\s,]+?)\s+(?:based|located)(?:\s|$|,|\.|!|\?)/i
      ];
      
      for (const pattern of locationPatterns) {
        const match = overview.match(pattern);
        if (match && match[1]) {
          const location = match[1].trim().replace(/,$/, '');
          if (location.length > 2) {
            updates.location = toTitleCase(location);
            break;
          }
        }
      }
    }
  }
  
  // 4. Extract skills with proper formatting
  if (!currentFormData.skills?.trim()) {
    let extractedSkills = extractSkills(overview);
    
    // Enhance with website technology stack
    if (websiteData?.technologies && websiteData.technologies.length > 0) {
      const websiteSkills = websiteData.technologies.join(', ');
      extractedSkills = extractedSkills ? `${extractedSkills}, ${websiteSkills}` : websiteSkills;
    }
    
    if (extractedSkills) {
      // Remove duplicates and format
      const skillsArray = extractedSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const uniqueSkills = Array.from(new Set(skillsArray));
      updates.skills = uniqueSkills.join(', ');
    }
  }
  
  // 5. Employment type detection
  if (!currentFormData.employmentType || currentFormData.employmentType === 'full-time') {
    const detectedType = normalizeEmploymentType(overview);
    if (detectedType !== 'full-time') {
      updates.employmentType = detectedType;
    }
  }
  
  // 6. Experience level detection
  if (!currentFormData.experienceLevel || currentFormData.experienceLevel === 'mid-level') {
    const detectedLevel = normalizeExperienceLevel(overview);
    if (detectedLevel !== 'mid-level') {
      updates.experienceLevel = detectedLevel;
    }
  }
  
  // 7. Location type detection
  if (!currentFormData.locationType || currentFormData.locationType === 'remote') {
    const detectedLocationType = normalizeLocationType(overview);
    if (detectedLocationType !== 'remote') {
      updates.locationType = detectedLocationType;
    }
  }
  
  // 8. Salary/Budget extraction based on employment type
  const isProject = updates.employmentType === 'project' || currentFormData.employmentType === 'project';
  
  if (isProject && !currentFormData.budget?.trim()) {
    const extractedBudget = extractSalaryOrBudget(overview, true);
    if (extractedBudget) {
      updates.budget = extractedBudget;
    }
  } else if (!isProject && !currentFormData.salary?.trim()) {
    const extractedSalary = extractSalaryOrBudget(overview, false);
    if (extractedSalary) {
      updates.salary = extractedSalary;
    }
  }
  
  // 9. Duration extraction for projects
  if (isProject && !currentFormData.duration?.trim()) {
    const extractedDuration = extractDuration(overview);
    if (extractedDuration) {
      updates.duration = extractedDuration;
    }
  }
  
  // 10. Benefits extraction for non-project roles
  if (!isProject && !currentFormData.benefits?.trim()) {
    let extractedBenefits = extractBenefits(overview);
    
    // Enhance with website benefits
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
