
import { UnifiedJobFormData } from "@/types/jobForm";
import { toTitleCase, isValidCompanyName } from "./formUtils";

// Comprehensive skills database
const SKILLS_DATABASE = {
  frontend: ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Sass', 'jQuery', 'Next.js', 'Nuxt.js'],
  backend: ['Node.js', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Express', 'Django', 'Flask', 'Spring', 'Laravel'],
  mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic', 'Xamarin'],
  database: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server'],
  cloud: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform'],
  tools: ['Git', 'GitHub', 'GitLab', 'Jenkins', 'Jira', 'Figma', 'Adobe', 'Sketch'],
  general: ['API', 'REST', 'GraphQL', 'Microservices', 'DevOps', 'CI/CD', 'Agile', 'Scrum']
};

const ALL_SKILLS = Object.values(SKILLS_DATABASE).flat();

// Employment type detection
export const extractEmploymentTypeFromOverview = (overview: string): string => {
  const text = overview.toLowerCase();
  
  if (text.includes('contract') || text.includes('contractor') || text.includes('freelance') || text.includes('consulting')) {
    return 'contract';
  }
  if (text.includes('part-time') || text.includes('part time')) {
    return 'part-time';
  }
  if (text.includes('project') || text.includes('short-term') || text.includes('temporary')) {
    return 'project';
  }
  
  return 'full-time'; // Default
};

// Work arrangement detection
export const extractLocationTypeFromOverview = (overview: string): string => {
  const text = overview.toLowerCase();
  
  if (text.includes('remote') || text.includes('distributed') || text.includes('anywhere') || text.includes('work from home')) {
    return 'remote';
  }
  if (text.includes('hybrid') || text.includes('flexible')) {
    return 'hybrid';
  }
  if (text.includes('on-site') || text.includes('office') || text.includes('in-person')) {
    return 'on-site';
  }
  
  // If specific location mentioned without remote keywords, likely on-site
  const locationPattern = /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)[,\s]+([A-Z]{2}|[A-Z][a-z]+)/i;
  if (locationPattern.test(overview) && !text.includes('remote')) {
    return 'on-site';
  }
  
  return 'remote'; // Default to remote if unclear
};

// Enhanced job title extraction
export const extractJobTitleFromOverview = (overview: string): string => {
  const text = overview.toLowerCase();
  
  // Enhanced patterns for various job title formats
  const patterns = [
    // "Senior React Developer" or "Lead UI/UX Designer"
    /(senior|junior|lead|principal|staff|head of|director of|vp of|chief)\s+([a-z/]+\s+)*([a-z/]+)/i,
    // "React Developer" or "Product Manager"
    /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z/]+)*(?:\s+(?:developer|engineer|designer|manager|analyst|specialist|coordinator|director|lead|consultant|architect)))/i,
    // "Software Engineer" or "Data Scientist"
    /(?:software|data|product|project|marketing|sales|business|systems|network|security|mobile|frontend|backend|fullstack|full-stack)\s+(?:engineer|developer|scientist|analyst|manager|specialist|architect)/i,
    // Generic roles
    /(developer|engineer|designer|manager|analyst|specialist|coordinator|director|consultant|architect)/i
  ];
  
  for (const pattern of patterns) {
    const match = overview.match(pattern);
    if (match) {
      let title = match[0].trim();
      // Clean up and title case
      title = title.replace(/^(for|at|with|as|the)\s+/i, '');
      if (title.length > 2) {
        return toTitleCase(title);
      }
    }
  }
  
  return '';
};

// Enhanced company name extraction
export const extractCompanyNameFromOverview = (overview: string): string => {
  // Multiple patterns for company extraction
  const patterns = [
    /(?:for|at|with)\s+([A-Z][a-zA-Z\s&,.-]{1,30})(?:\s+(?:in|at|located|based|company|corp|inc|llc))/i,
    /(?:for|at|with)\s+([A-Z][a-zA-Z\s&,.-]{1,30})(?:\s*[,.]|\s*$)/i,
    /(?:company|startup|agency|firm)\s+called\s+([A-Z][a-zA-Z\s&,.-]{1,30})/i
  ];
  
  for (const pattern of patterns) {
    const match = overview.match(pattern);
    if (match) {
      let companyName = match[1].trim();
      // Clean up generic words
      companyName = companyName.replace(/\s+(company|corp|inc|llc|agency|startup|firm|consulting|services|solutions|technologies|tech)$/i, '');
      if (companyName.length > 2 && isValidCompanyName(companyName)) {
        return companyName;
      }
    }
  }
  
  return '';
};

// Location extraction with multiple formats
export const extractLocationFromOverview = (overview: string): { location: string; state: string; city: string; country: string } => {
  const patterns = [
    // "in San Francisco, CA" or "in New York, NY"
    /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)[,\s]+([A-Z]{2}|[A-Z][a-z]+)(?:\s*,\s*(USA|US|United States))?/i,
    // "in Orange County CA"
    /in\s+([A-Z][a-z]+\s+County)\s+([A-Z]{2})/i,
    // "in London, UK" or "in Toronto, Canada"
    /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)[,\s]+(UK|Canada|Australia|Germany|France|Netherlands)/i,
    // "in California" or "in Texas"
    /in\s+(California|Texas|Florida|New York|Illinois|Pennsylvania|Ohio|Georgia|North Carolina|Michigan)/i
  ];
  
  for (const pattern of patterns) {
    const match = overview.match(pattern);
    if (match) {
      if (match[3]) { // Has country
        return {
          location: `${match[1]}, ${match[2]}, ${match[3]}`,
          city: match[1],
          state: match[2],
          country: match[3]
        };
      } else if (match[2]) {
        return {
          location: `${match[1]}, ${match[2]}`,
          city: match[1],
          state: match[2],
          country: 'US'
        };
      } else {
        return {
          location: match[1],
          city: '',
          state: match[1],
          country: 'US'
        };
      }
    }
  }
  
  return { location: '', city: '', state: '', country: '' };
};

// Experience level detection
export const extractExperienceLevelFromOverview = (overview: string): string => {
  const text = overview.toLowerCase();
  
  // Senior level indicators
  const seniorKeywords = ['senior', 'lead', 'principal', 'staff', 'director', 'head of', 'vp', 'vice president', 'chief', 'architect', 'manager'];
  for (const keyword of seniorKeywords) {
    if (text.includes(keyword)) {
      return 'senior-level';
    }
  }
  
  // Entry level indicators
  const entryKeywords = ['junior', 'entry', 'associate', 'trainee', 'intern', 'graduate', 'new grad', 'fresher', 'beginner'];
  for (const keyword of entryKeywords) {
    if (text.includes(keyword)) {
      return 'entry-level';
    }
  }
  
  return 'mid-level'; // Default
};

// Skills extraction
export const extractSkillsFromOverview = (overview: string, jobTitle: string = ''): string => {
  const foundSkills = new Set<string>();
  const textToAnalyze = (overview + ' ' + jobTitle).toLowerCase();
  
  // Direct skill matching
  ALL_SKILLS.forEach(skill => {
    if (textToAnalyze.includes(skill.toLowerCase())) {
      foundSkills.add(skill);
    }
  });
  
  // Role-based skill inference
  const roleSkillMap: Record<string, string[]> = {
    'react': ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
    'frontend': ['JavaScript', 'HTML', 'CSS', 'React', 'TypeScript'],
    'backend': ['Node.js', 'Python', 'API', 'Database'],
    'fullstack': ['React', 'Node.js', 'JavaScript', 'TypeScript', 'Database'],
    'mobile': ['React Native', 'Flutter', 'iOS', 'Android'],
    'data': ['Python', 'SQL', 'Machine Learning', 'Analytics'],
    'devops': ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    'designer': ['Figma', 'Adobe', 'UI/UX', 'Design'],
    'product': ['Analytics', 'Product Management', 'Agile', 'Scrum'],
    'marketing': ['Analytics', 'SEO', 'Content Marketing', 'Social Media']
  };
  
  Object.entries(roleSkillMap).forEach(([role, skills]) => {
    if (textToAnalyze.includes(role)) {
      skills.forEach(skill => foundSkills.add(skill));
    }
  });
  
  return Array.from(foundSkills).slice(0, 8).join(', '); // Limit to 8 skills
};

// Budget/Salary extraction
export const extractBudgetFromOverview = (overview: string, employmentType: string): { budget: string; salary: string } => {
  const salaryPatterns = [
    /\$?(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*(?:-|to)\s*\$?(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*(?:per\s+year|\/year|annually)?/,
    /\$?(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*(?:per\s+year|\/year|annually)/,
    /\$?(\d{2,3})\s*(?:-|to)\s*\$?(\d{2,3})\s*(?:per\s+hour|\/hour|hourly)/
  ];
  
  for (const pattern of salaryPatterns) {
    const match = overview.match(pattern);
    if (match) {
      if (employmentType === 'project' || employmentType === 'contract') {
        return { budget: match[0], salary: '' };
      } else {
        return { budget: '', salary: match[0] };
      }
    }
  }
  
  // Estimate based on role and experience level
  const experienceLevel = extractExperienceLevelFromOverview(overview);
  const jobTitle = extractJobTitleFromOverview(overview);
  
  if (jobTitle) {
    const estimates = getSalaryEstimate(jobTitle, experienceLevel, employmentType);
    return estimates;
  }
  
  return { budget: '', salary: '' };
};

// Duration extraction
export const extractDurationFromOverview = (overview: string): string => {
  const durationPatterns = [
    /(\d+)\s*(?:month|months)/i,
    /(\d+)\s*(?:week|weeks)/i,
    /(short-term|long-term|temporary|permanent)/i,
    /(\d+)\s*(?:year|years)/i
  ];
  
  for (const pattern of durationPatterns) {
    const match = overview.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return '';
};

// Helper function for salary estimation
const getSalaryEstimate = (jobTitle: string, experienceLevel: string, employmentType: string): { budget: string; salary: string } => {
  // Basic salary estimation logic
  const baseSalaries: Record<string, number> = {
    'developer': 85000,
    'engineer': 90000,
    'designer': 75000,
    'manager': 95000,
    'analyst': 70000,
    'specialist': 65000
  };
  
  const multipliers: Record<string, number> = {
    'entry-level': 0.7,
    'mid-level': 1.0,
    'senior-level': 1.4
  };
  
  let baseSalary = 75000; // Default
  for (const [role, salary] of Object.entries(baseSalaries)) {
    if (jobTitle.toLowerCase().includes(role)) {
      baseSalary = salary;
      break;
    }
  }
  
  const adjustedSalary = baseSalary * (multipliers[experienceLevel] || 1);
  
  if (employmentType === 'project' || employmentType === 'contract') {
    const hourlyRate = Math.round(adjustedSalary / 2000);
    return { budget: `$${hourlyRate}/hour`, salary: '' };
  } else {
    const minSalary = Math.round(adjustedSalary * 0.9);
    const maxSalary = Math.round(adjustedSalary * 1.2);
    return { budget: '', salary: `$${minSalary.toLocaleString()} - $${maxSalary.toLocaleString()}` };
  }
};

// Main auto-population function
export const autoPopulateFromOverview = (overview: string, currentData: UnifiedJobFormData): Partial<UnifiedJobFormData> => {
  if (!overview.trim()) return {};
  
  console.log('Auto-populating from overview:', overview);
  
  const updates: Partial<UnifiedJobFormData> = {};
  
  // Extract all information
  const title = extractJobTitleFromOverview(overview);
  const companyName = extractCompanyNameFromOverview(overview);
  const employmentType = extractEmploymentTypeFromOverview(overview);
  const experienceLevel = extractExperienceLevelFromOverview(overview);
  const locationType = extractLocationTypeFromOverview(overview);
  const locationInfo = extractLocationFromOverview(overview);
  const skills = extractSkillsFromOverview(overview, title);
  const { budget, salary } = extractBudgetFromOverview(overview, employmentType);
  const duration = extractDurationFromOverview(overview);
  
  // Only update empty fields
  if (title && !currentData.title) updates.title = title;
  if (companyName && !currentData.companyName) updates.companyName = companyName;
  if (employmentType !== 'full-time' && currentData.employmentType === 'full-time') updates.employmentType = employmentType;
  if (experienceLevel !== 'mid-level' && currentData.experienceLevel === 'mid-level') updates.experienceLevel = experienceLevel;
  if (locationType !== 'remote' && currentData.locationType === 'remote') updates.locationType = locationType;
  if (locationInfo.location && !currentData.location) updates.location = locationInfo.location;
  if (locationInfo.city && !currentData.city) updates.city = locationInfo.city;
  if (locationInfo.state && !currentData.state) updates.state = locationInfo.state;
  if (locationInfo.country && !currentData.country) updates.country = locationInfo.country;
  if (skills && !currentData.skills) updates.skills = skills;
  if (budget && !currentData.budget) updates.budget = budget;
  if (salary && !currentData.salary) updates.salary = salary;
  if (duration && !currentData.duration) updates.duration = duration;
  
  console.log('Auto-population updates:', updates);
  return updates;
};
