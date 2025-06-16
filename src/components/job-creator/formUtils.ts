
// Utility functions for form data processing

export const toTitleCase = (str: string): string => {
  if (!str) return str;
  
  // Handle special cases like UI/UX, AI/ML, etc.
  const specialCases = {
    'ui': 'UI',
    'ux': 'UX',
    'ai': 'AI',
    'ml': 'ML',
    'api': 'API',
    'seo': 'SEO',
    'cto': 'CTO',
    'ceo': 'CEO',
    'cfo': 'CFO',
    'hr': 'HR',
    'it': 'IT',
    'qa': 'QA',
    'devops': 'DevOps',
    'fullstack': 'Full-Stack',
    'frontend': 'Frontend',
    'backend': 'Backend'
  };
  
  return str.toLowerCase().split(' ').map(word => {
    // Handle words with slashes like UI/UX
    if (word.includes('/')) {
      return word.split('/').map(part => {
        const lowerPart = part.toLowerCase();
        return specialCases[lowerPart] || part.charAt(0).toUpperCase() + part.slice(1);
      }).join('/');
    }
    
    const lowerWord = word.toLowerCase();
    return specialCases[lowerWord] || word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

export const extractCompanyNameFromDomain = (url: string): string => {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    const parts = domain.replace('www.', '').split('.');
    const mainPart = parts[0];
    
    // Capitalize first letter and handle common patterns
    return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
  } catch {
    return '';
  }
};

export const isValidCompanyName = (name: string): boolean => {
  if (!name || name.length < 2) return false;
  
  const invalidPatterns = [
    /consulting agency/i,
    /the company/i,
    /company/i,
    /a startup/i,
    /business/i,
    /organization/i,
    /corporation/i,
    /agency/i,
    /^a /i,
    /^the /i
  ];
  
  return !invalidPatterns.some(pattern => pattern.test(name));
};
