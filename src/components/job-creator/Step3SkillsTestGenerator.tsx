
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, SkipForward } from "lucide-react";
import { SkillsQuestionEditor } from "./SkillsQuestionEditor";
import { SkillsTestData } from "@/types/skillsAssessment";
import { UnifiedJobCreatorActions } from "@/types/jobForm";

interface Step3SkillsTestGeneratorProps {
  generatedJobPost: string;
  skillsTestData: SkillsTestData;
  isGenerating: boolean;
  actions: UnifiedJobCreatorActions;
  onGenerateQuestions: () => Promise<void>;
  onSkillsTestDataChange: (data: SkillsTestData) => void;
}

export const Step3SkillsTestGenerator = ({
  generatedJobPost,
  skillsTestData,
  isGenerating,
  actions,
  onGenerateQuestions,
  onSkillsTestDataChange
}: Step3SkillsTestGeneratorProps) => {
  const hasQuestions = skillsTestData.questions.length > 0;

  if (!hasQuestions) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Skills Assessment Generator
            </CardTitle>
            <Badge variant="outline" className="text-xs text-gray-600 bg-gray-50">
              Optional
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create Skills Assessment
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Generate targeted assessment questions based on your job post to evaluate candidate skills effectively. This step is optional - you can skip it and proceed directly to publishing your job.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={onGenerateQuestions}
                disabled={isGenerating || !generatedJobPost}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="default"
              >
                {isGenerating ? 'Generating...' : 'Generate Questions'}
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => actions.setCurrentStep(4)}
                className="text-gray-600 hover:text-gray-800"
                size="default"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip Skills Test
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              You can always add a skills test later after publishing your job
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Skills Assessment Questions
            </CardTitle>
            <Badge variant="outline" className="text-xs text-gray-600 bg-gray-50">
              Optional
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onGenerateQuestions}
            disabled={isGenerating}
            className="text-xs h-8 px-3"
          >
            {isGenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4">
        <SkillsQuestionEditor
          skillsTestData={skillsTestData}
          onChange={onSkillsTestDataChange}
        />
      </CardContent>
    </Card>
  );
};
