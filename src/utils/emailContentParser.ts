
export interface ParsedEmailContent {
  cleanContent: string;
  hasQuotedReply: boolean;
  quotedContent?: string;
}

export const parseEmailContent = (rawContent: string): ParsedEmailContent => {
  if (!rawContent) {
    return { cleanContent: '', hasQuotedReply: false };
  }

  // Remove common email client tracking and metadata
  let content = rawContent
    // Remove Superhuman tracking
    .replace(/\[superhuman_tracking_pixel[^\]]*\]/gi, '')
    // Remove email headers that sometimes leak through
    .replace(/^(From|To|Subject|Date|Message-ID|In-Reply-To|References):\s*.*$/gm, '')
    // Remove threading information
    .replace(/\[Thread:[^\]]+\]/g, '')
    // Remove excessive whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  // Handle HTML content
  if (content.includes('<') && content.includes('>')) {
    content = parseHtmlContent(content);
  }

  // Detect and separate quoted replies
  const quotedSeparators = [
    /^On .* wrote:$/gm,
    /^From: .*$/gm,
    /^----- Original Message -----$/gm,
    /^> /gm,
    /^_{5,}$/gm
  ];

  let hasQuotedReply = false;
  let cleanContent = content;
  let quotedContent: string | undefined;

  // Check for quoted content patterns
  for (const separator of quotedSeparators) {
    const match = content.search(separator);
    if (match !== -1) {
      hasQuotedReply = true;
      cleanContent = content.substring(0, match).trim();
      quotedContent = content.substring(match).trim();
      break;
    }
  }

  // Clean up phone numbers and formatting
  cleanContent = cleanContent
    // Format phone numbers consistently
    .replace(/(\+?\d{1,3}[\s-]?)?\(?(\d{3})\)?[\s-]?(\d{3})[\s-]?(\d{4})/g, '($2) $3-$4')
    // Remove excessive spacing
    .replace(/\s{3,}/g, ' ')
    .trim();

  return {
    cleanContent,
    hasQuotedReply,
    quotedContent
  };
};

const parseHtmlContent = (htmlContent: string): string => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Remove script and style elements
  const scripts = tempDiv.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());

  // Remove tracking pixels and images without alt text
  const images = tempDiv.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt || img.src.includes('tracking') || img.width <= 1 || img.height <= 1) {
      img.remove();
    }
  });

  // Remove email client specific elements
  const clientElements = tempDiv.querySelectorAll('[class*="superhuman"], [class*="gmail"], [id*="tracking"]');
  clientElements.forEach(el => el.remove());

  // Get text content and preserve basic formatting
  let textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up whitespace
  textContent = textContent
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/gm, '')
    .trim();

  return textContent;
};

export const truncateContent = (content: string, maxLength: number = 500): string => {
  if (content.length <= maxLength) return content;
  
  const truncated = content.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
};
