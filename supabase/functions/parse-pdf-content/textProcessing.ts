
// Text cleaning and processing utilities
export function cleanExtractedText(extractedText: string): string {
  // Clean up the extracted text
  let cleanText = extractedText
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-.,!?():'\n]/g, ' ')
    .trim();
  
  // Remove excessive whitespace and normalize
  cleanText = cleanText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .replace(/\n\s*\n/g, '\n\n');
  
  return cleanText;
}

export function validateExtractedText(text: string): boolean {
  return text && text.length >= 10;
}
