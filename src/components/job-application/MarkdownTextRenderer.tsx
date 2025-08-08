
interface MarkdownTextRendererProps {
  text: string;
  className?: string;
}

export const MarkdownTextRenderer = ({ text, className = "" }: MarkdownTextRendererProps) => {
  if (!text) return null;

  // Clean incoming HTML-ish content into simple markdown-ish text
  const cleanToMarkdownish = (input: string): string => {
    if (!input) return "";
    let s = input;
    // Preserve structural breaks
    s = s.replace(/<br\s*\/?>(\s*)/gi, "\n");
    s = s.replace(/<\/(p|div)>\s*<\s*(p|div)[^>]*>/gi, "\n\n");
    s = s.replace(/<\/(p|div)>/gi, "\n\n");
    s = s.replace(/<li[^>]*>\s*/gi, "- ");
    s = s.replace(/<\/(li)>\s*/gi, "\n");
    // Map bold tags to markdown
    s = s.replace(/<\s*(strong|b)[^>]*>(.*?)<\s*\/\s*(strong|b)\s*>/gi, "**$2**");
    // Remove any remaining tags (like <p data-start="...">)
    s = s.replace(/<[^>]+>/g, "");
    // Decode basic HTML entities in the browser
    if (typeof window !== "undefined") {
      const txt = document.createElement("textarea");
      txt.innerHTML = s;
      s = txt.value;
    }
    // Normalize multiple newlines
    s = s.replace(/\n{3,}/g, "\n\n");
    return s.trim();
  };

  const renderMarkdown = (content: string): JSX.Element[] => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentParagraph: string[] = [];
    let key = 0;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ').trim();
        if (paragraphText) {
          elements.push(
            <p key={`p-${key++}`} className="mb-4 leading-relaxed text-gray-700">
              {formatInlineText(paragraphText)}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushParagraph();
        continue;
      }

      // Check for main headers (## Header)
      const h2Match = trimmedLine.match(/^##\s+(.+)$/);
      if (h2Match) {
        flushParagraph();
        elements.push(
          <h2 key={`h2-${key++}`} className="text-lg font-bold text-gray-900 mb-3 mt-6 first:mt-0">
            {h2Match[1]}
          </h2>
        );
        continue;
      }

      // Check for sub-headers (### Header or **Header**)
      const h3Match = trimmedLine.match(/^###\s+(.+)$/) || trimmedLine.match(/^\*\*(.+)\*\*$/);
      if (h3Match) {
        flushParagraph();
        elements.push(
          <h3 key={`h3-${key++}`} className="text-base font-semibold text-gray-900 mb-2 mt-4">
            {h3Match[1]}
          </h3>
        );
        continue;
      }

      // Check for numbered lists
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        flushParagraph();
        elements.push(
          <div key={`num-${key++}`} className="mb-2 flex items-start gap-3">
            <span className="font-bold text-blue-600 text-sm min-w-[1.5rem] mt-0.5">
              {numberedMatch[1]}.
            </span>
            <span className="text-gray-700 leading-relaxed">
              {formatInlineText(numberedMatch[2])}
            </span>
          </div>
        );
        continue;
      }

      // Check for bullet points
      const bulletMatch = trimmedLine.match(/^[-*•]\s+(.+)$/);
      if (bulletMatch) {
        flushParagraph();
        elements.push(
          <div key={`bullet-${key++}`} className="mb-2 flex items-start gap-3 ml-4">
            <span className="text-blue-600 text-sm min-w-[1rem] mt-1">•</span>
            <span className="text-gray-700 leading-relaxed">
              {formatInlineText(bulletMatch[1])}
            </span>
          </div>
        );
        continue;
      }

      // Regular text line
      currentParagraph.push(trimmedLine);
    }

    flushParagraph();
    return elements;
  };

  const formatInlineText = (text: string): JSX.Element => {
    // Handle inline bold text (**text**)
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={index} className="font-semibold text-gray-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {renderMarkdown(cleanToMarkdownish(text))}
    </div>
  );
};
