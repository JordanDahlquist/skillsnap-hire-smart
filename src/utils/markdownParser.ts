
export const parseMarkdown = (text: string): string => {
  if (!text) return '';
  
  // Split into lines for processing
  let lines = text.split('\n');
  let result = '';
  let inList = false;
  let listItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Handle empty lines
    if (!line) {
      // Close any open list
      if (inList) {
        result += `<ul class="list-disc pl-6 mb-4">${listItems.map(item => `<li class="mb-1">${item}</li>`).join('')}</ul>`;
        listItems = [];
        inList = false;
      }
      result += '<br>';
      continue;
    }
    
    // Handle bullet points (lines starting with * or -)
    if (line.match(/^[\*\-]\s+/)) {
      const content = line.replace(/^[\*\-]\s+/, '');
      const formattedContent = formatInlineMarkdown(content);
      
      if (!inList) {
        inList = true;
      }
      listItems.push(formattedContent);
      continue;
    }
    
    // Handle numbered lists
    if (line.match(/^\d+\.\s+/)) {
      const content = line.replace(/^\d+\.\s+/, '');
      const formattedContent = formatInlineMarkdown(content);
      
      if (inList && listItems.length > 0) {
        // Close previous unordered list
        result += `<ul class="list-disc pl-6 mb-4">${listItems.map(item => `<li class="mb-1">${item}</li>`).join('')}</ul>`;
        listItems = [];
      }
      
      if (!inList) {
        inList = true;
      }
      listItems.push(formattedContent);
      continue;
    }
    
    // Close any open list before regular text
    if (inList) {
      const listType = listItems.length > 0 && lines[i - listItems.length - 1]?.match(/^\d+\./) ? 'ol' : 'ul';
      const listClass = listType === 'ol' ? 'list-decimal pl-6 mb-4' : 'list-disc pl-6 mb-4';
      result += `<${listType} class="${listClass}">${listItems.map(item => `<li class="mb-1">${item}</li>`).join('')}</${listType}>`;
      listItems = [];
      inList = false;
    }
    
    // Handle headers (lines starting with # or ##)
    if (line.match(/^#{1,3}\s+/)) {
      const level = (line.match(/^#+/) || [''])[0].length;
      const content = line.replace(/^#+\s+/, '');
      const formattedContent = formatInlineMarkdown(content);
      const headerClass = level === 1 ? 'text-xl font-bold mb-3 mt-4' : 
                         level === 2 ? 'text-lg font-semibold mb-2 mt-3' : 
                         'text-base font-medium mb-2 mt-2';
      result += `<h${level} class="${headerClass}">${formattedContent}</h${level}>`;
      continue;
    }
    
    // Regular paragraph
    const formattedLine = formatInlineMarkdown(line);
    result += `<p class="mb-3 leading-relaxed">${formattedLine}</p>`;
  }
  
  // Close any remaining open list
  if (inList && listItems.length > 0) {
    result += `<ul class="list-disc pl-6 mb-4">${listItems.map(item => `<li class="mb-1">${item}</li>`).join('')}</ul>`;
  }
  
  return result;
};

const formatInlineMarkdown = (text: string): string => {
  // Handle bold text (**text**)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
  // Handle italic text (*text*) but not if it's at the start of line (bullet point)
  text = text.replace(/(?<!^)\*([^*]+)\*/g, '<em class="italic">$1</em>');
  
  // Handle inline code (`code`)
  text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  
  return text;
};
