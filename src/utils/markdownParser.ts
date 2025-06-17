export const parseMarkdown = (text: string): string => {
  if (!text) return '';
  
  // Normalize input
  const normalizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  // Multi-pass processing
  const contentBlocks = analyzeContentStructure(normalizedText);
  return generateHTML(contentBlocks);
};

interface ContentBlock {
  type: 'header' | 'list' | 'paragraph' | 'code';
  level?: number; // for headers
  content: string;
  items?: string[]; // for lists
  isNumbered?: boolean; // for lists
}

const analyzeContentStructure = (text: string): ContentBlock[] => {
  const blocks: ContentBlock[] = [];
  const lines = text.split('\n');
  let currentBlock: ContentBlock | null = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // Check for code blocks first
    if (line.startsWith('```')) {
      const codeBlock = processCodeBlock(lines, i);
      blocks.push(codeBlock.block);
      i = codeBlock.nextIndex;
      continue;
    }

    // Check for headers
    const headerResult = detectHeader(line);
    if (headerResult) {
      // Save any current block
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      
      blocks.push({
        type: 'header',
        level: headerResult.level,
        content: headerResult.content
      });
      i++;
      continue;
    }

    // Check for list items
    const listItemResult = detectListItem(line);
    if (listItemResult) {
      // If we're not in a list block or the list type changed, start a new one
      if (!currentBlock || 
          currentBlock.type !== 'list' || 
          currentBlock.isNumbered !== listItemResult.isNumbered) {
        
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        
        currentBlock = {
          type: 'list',
          content: '',
          items: [],
          isNumbered: listItemResult.isNumbered
        };
      }
      
      currentBlock.items!.push(listItemResult.content);
      i++;
      continue;
    }

    // Regular paragraph text
    if (!currentBlock || currentBlock.type !== 'paragraph') {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      
      currentBlock = {
        type: 'paragraph',
        content: line
      };
    } else {
      // Continue current paragraph
      currentBlock.content += '\n' + line;
    }
    
    i++;
  }

  // Don't forget the last block
  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
};

const detectHeader = (line: string): { level: number; content: string } | null => {
  // Main section headers: **Header** or *Header*
  const boldHeaderMatch = line.match(/^\*\*([^*]+)\*\*\s*$/);
  if (boldHeaderMatch) {
    return { level: 2, content: boldHeaderMatch[1].trim() };
  }
  
  const italicHeaderMatch = line.match(/^\*([^*]+)\*\s*$/);
  if (italicHeaderMatch) {
    return { level: 2, content: italicHeaderMatch[1].trim() };
  }

  // Subsection headers: **Header:** or **Header**:
  const subHeaderMatch = line.match(/^\*\*([^*]+):\*\*\s*$/) || line.match(/^\*\*([^*]+)\*\*:\s*$/);
  if (subHeaderMatch) {
    return { level: 3, content: subHeaderMatch[1].trim() + ':' };
  }

  // Traditional markdown headers
  const h3Match = line.match(/^### (.+)$/);
  if (h3Match) {
    return { level: 3, content: h3Match[1].trim() };
  }

  const h2Match = line.match(/^## (.+)$/);
  if (h2Match) {
    return { level: 2, content: h2Match[1].trim() };
  }

  const h1Match = line.match(/^# (.+)$/);
  if (h1Match) {
    return { level: 1, content: h1Match[1].trim() };
  }

  return null;
};

const detectListItem = (line: string): { content: string; isNumbered: boolean } | null => {
  // Bullet list item
  const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
  if (bulletMatch) {
    return { content: bulletMatch[1].trim(), isNumbered: false };
  }

  // Numbered list item
  const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
  if (numberedMatch) {
    return { content: numberedMatch[1].trim(), isNumbered: true };
  }

  return null;
};

const processCodeBlock = (lines: string[], startIndex: number): { block: ContentBlock; nextIndex: number } => {
  let i = startIndex + 1;
  let codeContent = '';
  
  while (i < lines.length && !lines[i].trim().startsWith('```')) {
    codeContent += lines[i] + '\n';
    i++;
  }
  
  return {
    block: {
      type: 'code',
      content: codeContent.trim()
    },
    nextIndex: i + 1
  };
};

const generateHTML = (blocks: ContentBlock[]): string => {
  return blocks.map(block => {
    switch (block.type) {
      case 'header':
        return generateHeaderHTML(block);
      case 'list':
        return generateListHTML(block);
      case 'paragraph':
        return generateParagraphHTML(block);
      case 'code':
        return generateCodeHTML(block);
      default:
        return '';
    }
  }).filter(html => html.trim()).join('\n\n');
};

const generateHeaderHTML = (block: ContentBlock): string => {
  const content = processInlineFormatting(block.content);
  
  switch (block.level) {
    case 1:
      return `<h1 class="text-lg font-semibold mb-3 mt-4 text-gray-900">${content}</h1>`;
    case 2:
      return `<h2 class="text-base font-semibold mb-2 mt-3 text-gray-900">${content}</h2>`;
    case 3:
      return `<h3 class="text-sm font-medium mb-2 mt-2 text-gray-800">${content}</h3>`;
    default:
      return `<h2 class="text-base font-semibold mb-2 mt-3 text-gray-900">${content}</h2>`;
  }
};

const generateListHTML = (block: ContentBlock): string => {
  if (!block.items || block.items.length === 0) return '';
  
  const listType = block.isNumbered ? 'ol' : 'ul';
  const listClass = block.isNumbered 
    ? 'list-decimal list-inside space-y-1 mb-3 pl-4'
    : 'list-disc list-inside space-y-1 mb-3 pl-4';
  
  const displayItems = block.items.slice(0, 8);
  const itemsHTML = displayItems
    .map(item => `<li class="ml-2 mb-1 leading-relaxed text-gray-700 text-sm">${processInlineFormatting(item)}</li>`)
    .join('');
  
  const moreItemsNote = block.items.length > 8 
    ? `<li class="ml-2 mb-1 leading-relaxed text-gray-500 text-sm italic">... and ${block.items.length - 8} more</li>`
    : '';
  
  return `<${listType} class="${listClass}">${itemsHTML}${moreItemsNote}</${listType}>`;
};

const generateParagraphHTML = (block: ContentBlock): string => {
  const content = processInlineFormatting(block.content);
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length <= 1) {
    return `<p class="mb-3 leading-relaxed text-gray-700 text-sm">${content}</p>`;
  } else {
    return `<p class="mb-3 leading-relaxed text-gray-700 text-sm">${lines.join('<br>')}</p>`;
  }
};

const generateCodeHTML = (block: ContentBlock): string => {
  return `<pre class="bg-gray-100 border border-gray-300 rounded-lg p-3 my-3 overflow-x-auto"><code class="text-xs font-mono text-gray-800">${block.content}</code></pre>`;
};

const processInlineFormatting = (text: string): string => {
  return text
    // Enhanced bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-medium text-gray-900">$1</strong>')
    // Enhanced italic text
    .replace(/\*(.+?)\*/g, '<em class="italic text-gray-800">$1</em>')
    // Enhanced inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-blue-700">$1</code>');
};
