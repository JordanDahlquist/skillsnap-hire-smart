
import { parseMarkdown } from "@/utils/markdownParser";

interface SkillsTestInstructionsProps {
  instructions: string;
}

export const SkillsTestInstructions = ({ instructions }: SkillsTestInstructionsProps) => {
  if (!instructions) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
      <h3 className="font-semibold text-blue-900 mb-4">Instructions</h3>
      <div 
        className="text-blue-800 prose prose-sm max-w-none 
          prose-headings:text-blue-900 prose-headings:font-semibold prose-headings:mb-2 prose-headings:mt-3
          prose-p:mb-3 prose-p:leading-relaxed prose-p:text-blue-800
          prose-ul:mb-4 prose-ul:space-y-2 prose-li:mb-2 prose-li:text-blue-800 prose-li:leading-relaxed
          prose-ol:mb-4 prose-ol:space-y-2 prose-li:mb-2 prose-li:text-blue-800 prose-li:leading-relaxed
          prose-strong:text-blue-900 prose-strong:font-semibold
          prose-code:bg-blue-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
        dangerouslySetInnerHTML={{ 
          __html: parseMarkdown(instructions) 
        }}
      />
    </div>
  );
};
