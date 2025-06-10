
export const validateEmailForm = (subject: string, content: string) => {
  const errors: string[] = [];
  
  if (!subject.trim()) {
    errors.push('Subject is required');
  }
  
  if (!content.trim()) {
    errors.push('Content is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const processTemplateVariables = (
  text: string, 
  application: { name: string; email: string }, 
  job: { title: string },
  companyName: string
) => {
  return text
    .replace(/{name}/g, application.name)
    .replace(/{email}/g, application.email)
    .replace(/{position}/g, job.title)
    .replace(/{company}/g, companyName);
};
