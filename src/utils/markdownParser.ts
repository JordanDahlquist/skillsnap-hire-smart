
export const parseMarkdown = (text: string): string => {
  if (!text) return '';
  
  // Pre-process: normalize line breaks and clean up spacing
  let processedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  // Split into paragraphs and process each one
  const paragraphs = processedText.split(/\n\s*\n/);
  
  const processedParagraphs = paragraphs.map(paragraph => {
    if (!paragraph.trim()) return '';
    
    return processParagraph(paragraph);
  });
  
  return processedParagraphs.filter(p => p.trim()).join('\n\n');
};

const processParagraph = (paragraph: string): string => {
  let processed = paragraph.trim();
  
  // Handle section headers (e.g., "*Job Summary *", "*Key Responsibilities *")
  processed = processed.replace(/^\*([^*]+)\*\s*$/gm, '<h2 class="text-2xl font-bold mb-6 mt-8 text-gray-900 border-b-2 border-blue-200 pb-3">$1</h2>');
  
  // Handle subsection headers (e.g., "**Requirements:**")
  processed = processed.replace(/^\*\*([^*]+):\*\*\s*$/gm, '<h3 class="text-xl font-semibold mb-4 mt-6 text-gray-800">$1:</h3>');
  
  // Handle traditional markdown headers
  processed = processed
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mb-4 mt-6 text-gray-800">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mb-6 mt-8 text-gray-900 border-b-2 border-blue-200 pb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-8 mt-8 text-gray-900 border-b-3 border-blue-300 pb-4">$1</h1>');
  
  // If it contains headers, don't wrap in paragraph tags
  if (processed.includes('<h1') || processed.includes('<h2') || processed.includes('<h3')) {
    return processed;
  }
  
  // Enhanced code blocks
  processed = processed
    .replace(/```([^`]+)```/g, '<pre class="bg-gray-100 border border-gray-300 rounded-lg p-4 my-6 overflow-x-auto shadow-sm"><code class="text-sm font-mono text-gray-800">$1</code></pre>');
  
  if (processed.includes('<pre')) {
    return processed;
  }
  
  // Check if this paragraph contains lists
  const hasBulletList = /^[-*•]\s+/m.test(processed);
  const hasNumberedList = /^\d+\.\s+/m.test(processed);
  
  if (hasBulletList || hasNumberedList) {
    return processListParagraph(processed, hasNumberedList);
  }
  
  // Apply inline formatting
  processed = processInlineFormatting(processed);
  
  // Convert to paragraph with line breaks
  const lines = processed.split('\n').filter(line => line.trim());
  if (lines.length <= 1) {
    return `<p class="mb-6 leading-relaxed text-gray-700 text-lg">${processed}</p>`;
  } else {
    return `<p class="mb-6 leading-relaxed text-gray-700 text-lg">${lines.join('<br>')}</p>`;
  }
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
      : /^[-*•]\s+/.test(trimmedLine);
    
    if (isNewItem) {
      // Save previous item if exists
      if (currentItem.trim()) {
        listItems.push(processInlineFormatting(currentItem.trim()));
      }
      
      // Start new item (remove the marker)
      currentItem = isNumbered 
        ? trimmedLine.replace(/^\d+\.\s+/, '')
        : trimmedLine.replace(/^[-*•]\s+/, '');
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
  
  // Limit the number of items displayed to avoid overwhelming lists
  const displayItems = listItems.slice(0, 8);
  
  // Generate HTML list with enhanced styling
  const listType = isNumbered ? 'ol' : 'ul';
  const listClass = isNumbered 
    ? 'list-decimal list-inside space-y-3 mb-8 pl-6'
    : 'list-disc list-inside space-y-3 mb-8 pl-6';
  
  const itemsHtml = displayItems
    .map(item => `<li class="ml-4 mb-3 leading-relaxed text-gray-700 text-lg">${item}</li>`)
    .join('');
  
  const moreItemsNote = listItems.length > 8 
    ? `<li class="ml-4 mb-3 leading-relaxed text-gray-500 text-lg italic">... and ${listItems.length - 8} more</li>`
    : '';
  
  return `<${listType} class="${listClass}">${itemsHtml}${moreItemsNote}</${listType}>`;
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
