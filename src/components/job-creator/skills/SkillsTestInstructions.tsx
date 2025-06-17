
interface SkillsTestInstructionsProps {
  instructions: string;
}

export const SkillsTestInstructions = ({ instructions }: SkillsTestInstructionsProps) => {
  if (!instructions) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="font-semibold text-blue-900 mb-4 text-lg">Instructions for Candidates</h3>
      <div className="text-blue-800 leading-relaxed space-y-3">
        {instructions.split('\n').map((paragraph, index) => {
          if (!paragraph.trim()) return null;
          
          return (
            <p key={index} className="text-blue-800 leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </div>
    </div>
  );
};
