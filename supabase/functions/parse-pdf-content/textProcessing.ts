
// Text processing utilities for PDF extraction
export function cleanExtractedText(text: string): string {
  if (!text || text.length < 10) {
    return '';
  }
  
  // Remove excessive whitespace and normalize line breaks
  let cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  // Remove common PDF artifacts
  cleaned = cleaned
    .replace(/[^\x20-\x7E\n]/g, ' ') // Remove non-printable characters except newlines
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
  
  return cleaned;
}

export function validateExtractedText(text: string): boolean {
  if (!text || text.length < 20) {
    return false;
  }
  
  // Check if text contains meaningful content
  const wordCount = text.split(/\s+/).filter(word => word.length > 2).length;
  const hasLetters = /[a-zA-Z]/.test(text);
  const ratio = text.replace(/[a-zA-Z\s]/g, '').length / text.length;
  
  return wordCount >= 10 && hasLetters && ratio < 0.5;
}

export function extractKeywords(text: string): string[] {
  const keywords = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.length > 5 && line.length < 100) {
      // Look for email patterns
      const emailMatch = line.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) {
        keywords.push('EMAIL: ' + emailMatch[0]);
      }
      
      // Look for phone patterns
      const phoneMatch = line.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
      if (phoneMatch) {
        keywords.push('PHONE: ' + phoneMatch[0]);
      }
      
      // Look for common resume sections
      const sectionMatch = line.match(/^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|PROFILE)/i);
      if (sectionMatch) {
        keywords.push('SECTION: ' + sectionMatch[0]);
      }
    }
  }
  
  return keywords;
}
