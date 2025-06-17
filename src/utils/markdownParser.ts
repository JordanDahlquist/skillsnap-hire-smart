
export const parseMarkdown = (text: string): string => {
  if (!text) return '';
  
  // Pre-process: normalize line breaks and clean up spacing
  let processedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Ensure numbered lists have proper line breaks
    .replace(/(\d+\.\s+)/g, '\n$1')
    // Ensure bullet points have proper line breaks
    .replace(/([-*]\s+)/g, '\n$1')
    // Clean up multiple consecutive newlines but preserve intentional spacing
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Split into paragraphs first to handle them individually
  const paragraphs = processedText.split(/\n\s*\n/);
  
  const processedParagraphs = paragraphs.map(paragraph => {
    if (!paragraph.trim()) return '';
    
    // Check if this paragraph contains lists
    const hasNumberedList = /^\s*\d+\.\s+/m.test(paragraph);
    const hasBulletList = /^\s*[-*]\s+/m.test(paragraph);
    
    if (hasNumberedList || hasBulletList) {
      return processListParagraph(paragraph, hasNumberedList);
    } else {
      return processRegularParagraph(paragraph);
    }
  });
  
  return processedParagraphs.filter(p => p.trim()).join('\n\n');
};

const processListParagraph = (paragraph: string, isNumbered: boolean): string => {
  const lines = paragraph.split('\n').filter(line => line.trim());
  const listItems: string[] = [];
  let currentItem = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if this line starts a new list item
    const isNewItem = isNumbered 
      ? /^\d+\.\s+/.test(trimmedLine)
      : /^[-*]\s+/.test(trimmedLine);
    
    if (isNewItem) {
      // Save previous item if exists
      if (currentItem.trim()) {
        listItems.push(processInlineFormatting(currentItem.trim()));
      }
      
      // Start new item (remove the marker)
      currentItem = isNumbered 
        ? trimmedLine.replace(/^\d+\.\s+/, '')
        : trimmedLine.replace(/^[-*]\s+/, '');
    } else if (trimmedLine) {
      // Continue current item
      currentItem += ' ' + trimmedLine;
    }
  }
  
  // Don't forget the last item
  if (currentItem.trim()) {
    listItems.push(processInlineFormatting(currentItem.trim()));
  }
  
  if (listItems.length === 0) return '';
  
  // Generate HTML list with enhanced styling
  const listType = isNumbered ? 'ol' : 'ul';
  const listClass = isNumbered 
    ? 'list-decimal list-inside space-y-3 mb-6 pl-4'
    : 'list-disc list-inside space-y-3 mb-6 pl-4';
  
  const itemsHtml = listItems
    .map(item => `<li class="ml-6 mb-3 leading-relaxed text-gray-700 text-base">${item}</li>`)
    .join('');
  
  return `<${listType} class="${listClass}">${itemsHtml}</${listType}>`;
};

const processRegularParagraph = (paragraph: string): string => {
  let processed = paragraph;
  
  // Enhanced headers with better visual hierarchy
  processed = processed
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mb-4 mt-6 text-gray-900 border-b-2 border-blue-100 pb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mb-5 mt-8 text-gray-900 border-b-3 border-blue-200 pb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-6 mt-8 text-gray-900 border-b-4 border-blue-300 pb-4">$1</h1>');
  
  // If it contains headers, don't wrap in paragraph tags
  if (processed.includes('<h1') || processed.includes('<h2') || processed.includes('<h3')) {
    return processed;
  }
  
  // Enhanced code blocks
  processed = processed
    .replace(/```([^`]+)```/g, '<pre class="bg-gray-100 border border-gray-300 rounded-lg p-4 my-4 overflow-x-auto shadow-sm"><code class="text-sm font-mono text-gray-800">$1</code></pre>');
  
  if (processed.includes('<pre')) {
    return processed;
  }
  
  // Apply inline formatting
  processed = processInlineFormatting(processed);
  
  // Convert to paragraph with line breaks
  const lines = processed.split('\n').filter(line => line.trim());
  if (lines.length <= 1) {
    return `<p class="mb-4 leading-relaxed text-gray-700 text-base">${processed}</p>`;
  } else {
    return `<p class="mb-4 leading-relaxed text-gray-700 text-base">${lines.join('<br>')}</p>`;
  }
};

const processInlineFormatting = (text: string): string => {
  return text
    // Enhanced bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    // Enhanced italic text
    .replace(/\*(.+?)\*/g, '<em class="italic text-gray-800">$1</em>')
    // Enhanced inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-700 border">$1</code>');
};
