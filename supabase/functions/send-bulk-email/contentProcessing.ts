
// Content processing utilities for email formatting

// Helper function to format content with proper bullet points and line breaks
export const formatEmailContent = (content: string): string => {
  if (!content) return '';
  
  // Convert rich text to plain text for email while preserving structure
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  let plainText = tempDiv.textContent || tempDiv.innerText || content;
  
  // Convert line breaks to proper format
  plainText = plainText.replace(/\n/g, '\n');
  
  // Convert dash bullets to proper bullet points
  plainText = plainText.replace(/^-\s*(.+)$/gm, '• $1');
  plainText = plainText.replace(/\n-\s*(.+)/g, '\n• $1');
  
  // Convert asterisk bullets to proper bullet points
  plainText = plainText.replace(/^\*\s*(.+)$/gm, '• $1');
  plainText = plainText.replace(/\n\*\s*(.+)/g, '\n• $1');
  
  return plainText;
};

// Enhanced function to create HTML version with proper bullet formatting
export const createHtmlContent = (content: string): string => {
  if (!content) return '';
  
  let htmlContent = content;
  
  // Handle HTML div tags with bullets (from rich text editor)
  // Convert <div>-bullet</div> to <div>• bullet</div>
  htmlContent = htmlContent.replace(/<div>-\s*([^<]+)<\/div>/gi, '<div>• $1</div>');
  htmlContent = htmlContent.replace(/<div>\*\s*([^<]+)<\/div>/gi, '<div>• $1</div>');
  
  // Handle HTML p tags with bullets
  htmlContent = htmlContent.replace(/<p>-\s*([^<]+)<\/p>/gi, '<p>• $1</p>');
  htmlContent = htmlContent.replace(/<p>\*\s*([^<]+)<\/p>/gi, '<p>• $1</p>');
  
  // Handle line breaks followed by bullets
  htmlContent = htmlContent.replace(/<br\s*\/?>\s*-\s*([^<\n]+)/gi, '<br>• $1');
  htmlContent = htmlContent.replace(/<br\s*\/?>\s*\*\s*([^<\n]+)/gi, '<br>• $1');
  
  // Handle plain text bullets at start of content or after line breaks
  htmlContent = htmlContent.replace(/^-\s*(.+)$/gm, '• $1');
  htmlContent = htmlContent.replace(/\n-\s*(.+)/g, '\n• $1');
  htmlContent = htmlContent.replace(/^-([^\s])(.*)$/gm, '• $1$2'); // Handle -bullet without space
  htmlContent = htmlContent.replace(/\n-([^\s])(.*)$/gm, '\n• $1$2'); // Handle -bullet without space after newline
  
  htmlContent = htmlContent.replace(/^\*\s*(.+)$/gm, '• $1');
  htmlContent = htmlContent.replace(/\n\*\s*(.+)/g, '\n• $1');
  htmlContent = htmlContent.replace(/^\*([^\s])(.*)$/gm, '• $1$2'); // Handle *bullet without space
  htmlContent = htmlContent.replace(/\n\*([^\s])(.*)$/gm, '\n• $1$2'); // Handle *bullet without space after newline
  
  // Convert line breaks to HTML breaks if not already HTML
  if (!htmlContent.includes('<') || htmlContent.includes('\n')) {
    htmlContent = htmlContent.replace(/\n/g, '<br>');
  }
  
  return htmlContent;
};

// Process template variables in content
export const processTemplateVariables = (
  content: string,
  applicationName: string,
  applicationEmail: string,
  jobTitle: string,
  companyName: string
): string => {
  return content
    .replace(/{name}/g, applicationName)
    .replace(/{candidateName}/g, applicationName)
    .replace(/{email}/g, applicationEmail)
    .replace(/{candidateEmail}/g, applicationEmail)
    .replace(/{position}/g, jobTitle)
    .replace(/{jobTitle}/g, jobTitle)
    .replace(/{company}/g, companyName)
    .replace(/{companyName}/g, companyName);
};
