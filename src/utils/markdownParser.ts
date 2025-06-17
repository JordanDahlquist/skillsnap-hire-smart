
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
  
  // Generate HTML list
  const listType = isNumbered ? 'ol' : 'ul';
  const listClass = isNumbered 
    ? 'list-decimal list-inside space-y-2 mb-4 pl-2'
    : 'list-disc list-inside space-y-2 mb-4 pl-2';
  
  const itemsHtml = listItems
    .map(item => `<li class="ml-4 mb-2 leading-relaxed">${item}</li>`)
    .join('');
  
  return `<${listType} class="${listClass}">${itemsHtml}</${listType}>`;
};

const processRegularParagraph = (paragraph: string): string => {
  let processed = paragraph;
  
  // Headers with proper spacing
  processed = processed
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mb-3 mt-4 text-gray-900">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mb-3 mt-5 text-gray-900">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mb-4 mt-6 text-gray-900">$1</h1>');
  
  // If it contains headers, don't wrap in paragraph tags
  if (processed.includes('<h1') || processed.includes('<h2') || processed.includes('<h3')) {
    return processed;
  }
  
  // Code blocks
  processed = processed
    .replace(/```([^`]+)```/g, '<pre class="bg-gray-100 border border-gray-200 rounded p-3 my-3 overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>');
  
  if (processed.includes('<pre')) {
    return processed;
  }
  
  // Apply inline formatting
  processed = processInlineFormatting(processed);
  
  // Convert to paragraph with line breaks
  const lines = processed.split('\n').filter(line => line.trim());
  if (lines.length <= 1) {
    return `<p class="mb-3 leading-relaxed">${processed}</p>`;
  } else {
    return `<p class="mb-3 leading-relaxed">${lines.join('<br>')}</p>`;
  }
};

const processInlineFormatting = (text: string): string => {
  return text
    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    // Italic text
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
};
