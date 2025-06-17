
import { Card, CardContent } from "@/components/ui/card";
import { SkillsTestData } from "@/types/skillsAssessment";
import { SkillsTestPreviewHeader } from "./SkillsTestPreviewHeader";
import { SkillsTestInstructions } from "./SkillsTestInstructions";
import { SkillsTestQuestionCard } from "./SkillsTestQuestionCard";
import { SkillsTestSubmitSection } from "./SkillsTestSubmitSection";

interface SkillsTestPreviewProps {
  skillsTestData: SkillsTestData;
  onBack: () => void;
}

export const SkillsTestPreview = ({ skillsTestData, onBack }: SkillsTestPreviewProps) => {
  const estimatedTime = skillsTestData.estimatedCompletionTime || 
    skillsTestData.questions.length * 5; // 5 minutes per question as default

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <SkillsTestPreviewHeader 
        onBack={onBack}
        estimatedTime={estimatedTime}
        questionCount={skillsTestData.questions.length}
      />

      <CardContent className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <SkillsTestInstructions instructions={skillsTestData.instructions || ""} />

          {/* Questions */}
          <div className="space-y-6">
            {skillsTestData.questions.map((question, index) => (
              <SkillsTestQuestionCard
                key={question.id}
                question={question}
                index={index}
              />
            ))}
          </div>

          <SkillsTestSubmitSection />
        </div>
      </CardContent>
    </Card>
  );
};
