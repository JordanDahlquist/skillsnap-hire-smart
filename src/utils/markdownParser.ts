
export const parseMarkdown = (text: string): string => {
  if (!text) return '';
  
  let html = text
    // Headers with proper spacing
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mb-2 mt-4 text-gray-900">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mb-3 mt-5 text-gray-900">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mb-4 mt-6 text-gray-900">$1</h1>')
    
    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    
    // Italic text
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    
    // Code blocks
    .replace(/```([^`]+)```/g, '<pre class="bg-gray-100 border border-gray-200 rounded p-3 my-3 overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>')
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // Bullet points (- or *)
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
    
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
    
    // Paragraphs - split by double line breaks
    .split('\n\n')
    .map(paragraph => {
      if (paragraph.includes('<li')) {
        // This is a list, don't wrap in p tags
        return paragraph;
      } else if (paragraph.includes('<h1') || paragraph.includes('<h2') || paragraph.includes('<h3') || paragraph.includes('<pre')) {
        // This is a header or code block, don't wrap in p tags
        return paragraph;
      } else if (paragraph.trim()) {
        // This is a regular paragraph
        return `<p class="mb-3 leading-relaxed">${paragraph.replace(/\n/g, '<br>')}</p>`;
      }
      return paragraph;
    })
    .join('\n');
  
  // Wrap consecutive <li> elements in <ul> with proper spacing
  html = html.replace(/(<li[^>]*>.*?<\/li>(\s*<br>\s*)?)+/g, (match) => {
    const items = match.replace(/<br>/g, '').trim();
    return `<ul class="list-disc list-inside space-y-1 mb-4 pl-2">${items}</ul>`;
  });
  
  // Clean up any remaining <br> tags that might be leftover
  html = html.replace(/<br>\s*<br>/g, '<br>');
  
  return html;
};
