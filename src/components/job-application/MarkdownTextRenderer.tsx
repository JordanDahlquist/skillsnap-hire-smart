
interface MarkdownTextRendererProps {
  text: string;
  className?: string;
}

export const MarkdownTextRenderer = ({ text, className = "" }: MarkdownTextRendererProps) => {
  if (!text) return null;

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
            <p key={`p-${key++}`} className="mb-3 leading-relaxed text-sm text-gray-700">
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

      // Check for bold headers
      const boldHeaderMatch = trimmedLine.match(/^\*\*(.+)\*\*$/);
      if (boldHeaderMatch) {
        flushParagraph();
        elements.push(
          <h3 key={`h-${key++}`} className="font-semibold text-gray-900 mb-2 mt-4 text-sm">
            {boldHeaderMatch[1]}
          </h3>
        );
        continue;
      }

      // Check for numbered lists
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        flushParagraph();
        elements.push(
          <div key={`n-${key++}`} className="mb-2 flex items-start gap-2">
            <span className="font-medium text-blue-700 text-sm min-w-[1.5rem]">
              {numberedMatch[1]}.
            </span>
            <span className="text-sm text-gray-700 leading-relaxed">
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
          <div key={`b-${key++}`} className="mb-2 flex items-start gap-2">
            <span className="text-blue-700 text-sm min-w-[1rem]">•</span>
            <span className="text-sm text-gray-700 leading-relaxed">
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
    // Handle inline bold text
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={index} className="font-medium text-gray-900">
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
      {renderMarkdown(text)}
    </div>
  );
};
