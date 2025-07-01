
export const cleanEmailContent = (content: string): string => {
  if (!content) return '';

  let cleanedContent = content;

  // Remove common email headers and metadata
  cleanedContent = cleanedContent.replace(/^(From|To|Subject|Date|Sent|Reply-To):.*$/gm, '');
  
  // Remove "On [date] at [time], [sender] wrote:" patterns
  cleanedContent = cleanedContent.replace(/On .+? at .+?, .+? wrote:/g, '');
  cleanedContent = cleanedContent.replace(/On .+?, .+? wrote:/g, '');
  
  // Remove email signatures (common patterns)
  cleanedContent = cleanedContent.replace(/--\s*\n[\s\S]*$/m, '');
  cleanedContent = cleanedContent.replace(/Best regards?,?\s*\n[\s\S]*$/mi, '');
  cleanedContent = cleanedContent.replace(/Sincerely,?\s*\n[\s\S]*$/mi, '');
  cleanedContent = cleanedContent.replace(/Thanks?,?\s*\n[\s\S]*$/mi, '');
  
  // Remove quoted text markers
  cleanedContent = cleanedContent.replace(/^>\s?/gm, '');
  
  // Remove excessive whitespace
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleanedContent = cleanedContent.replace(/^\s+|\s+$/g, '');
  
  // Clean up HTML if present
  if (cleanedContent.includes('<')) {
    // Remove email client specific HTML
    cleanedContent = cleanedContent.replace(/<div[^>]*class="[^"]*gmail[^"]*"[^>]*>/gi, '<div>');
    cleanedContent = cleanedContent.replace(/<div[^>]*class="[^"]*outlook[^"]*"[^>]*>/gi, '<div>');
    
    // Remove inline styles that might break formatting
    cleanedContent = cleanedContent.replace(/style="[^"]*"/gi, '');
    
    // Remove empty paragraphs and divs
    cleanedContent = cleanedContent.replace(/<p[^>]*>\s*<\/p>/gi, '');
    cleanedContent = cleanedContent.replace(/<div[^>]*>\s*<\/div>/gi, '');
  }
  
  return cleanedContent;
};

export const extractMessagePreview = (content: string, maxLength: number = 150): string => {
  const cleaned = cleanEmailContent(content);
  
  // Strip HTML tags for preview
  const textOnly = cleaned.replace(/<[^>]*>/g, '');
  
  if (textOnly.length <= maxLength) {
    return textOnly;
  }
  
  return textOnly.substring(0, maxLength).trim() + '...';
};
