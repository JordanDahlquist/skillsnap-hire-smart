
export const cleanEmailContent = (content: string): string => {
  if (!content) return '';

  let cleanedContent = content;

  // Remove common email headers and metadata
  cleanedContent = cleanedContent.replace(/^(From|To|Subject|Date|Sent|Reply-To|Cc|Bcc):.*$/gm, '');
  
  // Remove "On [date] at [time], [sender] wrote:" patterns (more comprehensive)
  cleanedContent = cleanedContent.replace(/On .+? at .+?, .+? wrote:/g, '');
  cleanedContent = cleanedContent.replace(/On .+?, .+? wrote:/g, '');
  cleanedContent = cleanedContent.replace(/\d{1,2}\/\d{1,2}\/\d{4}.*?wrote:/g, '');
  cleanedContent = cleanedContent.replace(/\w{3}, \d{1,2} \w{3} \d{4}.*?wrote:/g, '');
  
  // Remove email signatures (comprehensive patterns)
  cleanedContent = cleanedContent.replace(/--\s*\n[\s\S]*$/m, '');
  cleanedContent = cleanedContent.replace(/Best regards?,?\s*\n[\s\S]*$/mi, '');
  cleanedContent = cleanedContent.replace(/Sincerely,?\s*\n[\s\S]*$/mi, '');
  cleanedContent = cleanedContent.replace(/Thanks?,?\s*\n[\s\S]*$/mi, '');
  cleanedContent = cleanedContent.replace(/Kind regards?,?\s*\n[\s\S]*$/mi, '');
  cleanedContent = cleanedContent.replace(/Cheers,?\s*\n[\s\S]*$/mi, '');
  
  // Remove Superhuman signatures
  cleanedContent = cleanedContent.replace(/Sent via Superhuman.*$/mi, '');
  cleanedContent = cleanedContent.replace(/https:\/\/sprh\.mn\/.*$/gm, '');
  
  // Remove Gmail mobile signatures
  cleanedContent = cleanedContent.replace(/Sent from my iPhone.*$/mi, '');
  cleanedContent = cleanedContent.replace(/Sent from my Android.*$/mi, '');
  cleanedContent = cleanedContent.replace(/Get Outlook for.*$/mi, '');
  
  // Remove quoted text markers and nested replies
  cleanedContent = cleanedContent.replace(/^>\s?/gm, '');
  cleanedContent = cleanedContent.replace(/^>+.*$/gm, '');
  
  // Remove forwarded message indicators
  cleanedContent = cleanedContent.replace(/---------- Forwarded message ---------/g, '');
  cleanedContent = cleanedContent.replace(/----- Original Message -----/g, '');
  
  // Remove email tracking pixels and hidden content
  cleanedContent = cleanedContent.replace(/<img[^>]*style="[^"]*display:\s*none[^"]*"[^>]*>/gi, '');
  cleanedContent = cleanedContent.replace(/<div[^>]*style="[^"]*display:\s*none[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  
  // Remove excessive whitespace and normalize line breaks
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n+/g, '\n\n');
  cleanedContent = cleanedContent.replace(/^\s+|\s+$/g, '');
  cleanedContent = cleanedContent.replace(/\s+$/gm, '');
  
  // Clean up HTML if present
  if (cleanedContent.includes('<')) {
    // Remove email client specific HTML and styles
    cleanedContent = cleanedContent.replace(/<div[^>]*class="[^"]*gmail[^"]*"[^>]*>/gi, '<div>');
    cleanedContent = cleanedContent.replace(/<div[^>]*class="[^"]*outlook[^"]*"[^>]*>/gi, '<div>');
    cleanedContent = cleanedContent.replace(/<span[^>]*class="[^"]*gmail[^"]*"[^>]*>/gi, '<span>');
    
    // Remove inline styles that might break formatting
    cleanedContent = cleanedContent.replace(/style="[^"]*"/gi, '');
    cleanedContent = cleanedContent.replace(/class="[^"]*"/gi, '');
    
    // Remove empty paragraphs and divs
    cleanedContent = cleanedContent.replace(/<p[^>]*>\s*<\/p>/gi, '');
    cleanedContent = cleanedContent.replace(/<div[^>]*>\s*<\/div>/gi, '');
    cleanedContent = cleanedContent.replace(/<span[^>]*>\s*<\/span>/gi, '');
    
    // Remove font tags and other formatting
    cleanedContent = cleanedContent.replace(/<\/?font[^>]*>/gi, '');
    cleanedContent = cleanedContent.replace(/<\/?o:p[^>]*>/gi, '');
    
    // Clean up excessive nested divs
    cleanedContent = cleanedContent.replace(/<div[^>]*>\s*<div[^>]*>/gi, '<div>');
    cleanedContent = cleanedContent.replace(/<\/div>\s*<\/div>/gi, '</div>');
  }
  
  // Final cleanup - remove any remaining metadata patterns
  cleanedContent = cleanedContent.replace(/^\*.*\*\s*$/gm, ''); // Remove lines with just asterisks
  cleanedContent = cleanedContent.replace(/^\(.*\)\s*$/gm, ''); // Remove lines with just parentheses
  
  return cleanedContent.trim();
};

export const extractMessagePreview = (content: string, maxLength: number = 150): string => {
  const cleaned = cleanEmailContent(content);
  
  // Strip HTML tags for preview
  const textOnly = cleaned.replace(/<[^>]*>/g, '');
  
  if (textOnly.length <= maxLength) {
    return textOnly;
  }
  
  // Try to break at a sentence or word boundary
  const truncated = textOnly.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastPeriod > maxLength * 0.7) {
    return truncated.substring(0, lastPeriod + 1);
  } else if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated.trim() + '...';
};

export const detectEmailType = (content: string): 'reply' | 'forward' | 'original' => {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('forwarded message') || lowerContent.includes('fwd:')) {
    return 'forward';
  }
  
  if (lowerContent.includes('wrote:') || lowerContent.includes('re:') || content.includes('>')) {
    return 'reply';
  }
  
  return 'original';
};
