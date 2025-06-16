
export const parseMarkdown = (text: string): string => {
  if (!text) return '';
  
  let html = text
    // Headers
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mb-2 mt-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mb-3 mt-4">$1</h1>')
    
    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    
    // Bullet points
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>')
    
    // Line breaks
    .replace(/\n/g, '<br>');
  
  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/(<li[^>]*>.*?<\/li>(\s*<br>\s*)?)+/g, (match) => {
    const items = match.replace(/<br>/g, '').trim();
    return `<ul class="list-disc list-inside space-y-1 mb-3">${items}</ul>`;
  });
  
  return html;
};
