
export const processTemplateVariables = (
  text: string, 
  variables: Record<string, string> = {}
): string => {
  if (!text) return '';
  
  let processedText = text;
  
  // Default variable mappings
  const defaultVariables = {
    position: 'Position',
    company: 'Company',
    candidateName: 'Candidate',
    companyName: 'Our Company',
    jobTitle: 'Position',
    ...variables
  };
  
  // Replace template variables like {position}, {company}, etc.
  Object.entries(defaultVariables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    processedText = processedText.replace(regex, value);
  });
  
  // Clean up any remaining unreplaced variables
  processedText = processedText.replace(/\{[^}]+\}/g, '');
  
  // Clean up extra spaces
  processedText = processedText.replace(/\s+/g, ' ').trim();
  
  return processedText;
};

export const hasUnprocessedVariables = (text: string): boolean => {
  return /\{[^}]+\}/.test(text);
};

export const extractVariables = (text: string): string[] => {
  const matches = text.match(/\{([^}]+)\}/g);
  return matches ? matches.map(match => match.slice(1, -1)) : [];
};
