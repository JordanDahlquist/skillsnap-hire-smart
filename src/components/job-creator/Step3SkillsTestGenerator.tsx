
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, SkipForward, Settings } from "lucide-react";
import { SkillsTestData, SkillsTestTemplate } from "@/types/skillsAssessment";
import { UnifiedJobCreatorActions } from "@/types/jobForm";
import { SkillsTestTemplateSelector } from "./skills/SkillsTestTemplateSelector";
import { EnhancedSkillsQuestionEditor } from "./skills/EnhancedSkillsQuestionEditor";
import { SkillsTestPreview } from "./skills/SkillsTestPreview";
import { CustomSpinningLogo } from "@/components/CustomSpinningLogo";

interface Step3SkillsTestGeneratorProps {
  generatedJobPost: string;
  skillsTestData: SkillsTestData;
  skillsTestViewState: 'initial' | 'template_selector' | 'editor' | 'preview';
  isGenerating: boolean;
  actions: UnifiedJobCreatorActions;
  onGenerateQuestions: () => Promise<void>;
  onSkillsTestDataChange: (data: SkillsTestData) => void;
}

export const Step3SkillsTestGenerator = ({
  generatedJobPost,
  skillsTestData,
  skillsTestViewState,
  isGenerating,
  actions,
  onGenerateQuestions,
  onSkillsTestDataChange
}: Step3SkillsTestGeneratorProps) => {
  // Smart initial view determination - if we have questions, show editor
  useEffect(() => {
    if (skillsTestViewState === 'initial' && skillsTestData.questions.length > 0) {
      actions.setSkillsTestViewState('editor');
    }
  }, [skillsTestData.questions.length, skillsTestViewState, actions]);
  
  const hasQuestions = skillsTestData.questions.length > 0;

  const handleGenerateWithAI = async () => {
    // Update mode and generate questions directly
    const updatedData = { ...skillsTestData, mode: 'ai_generated' as const };
    onSkillsTestDataChange(updatedData);
    await onGenerateQuestions();
    actions.setSkillsTestViewState('editor');
  };

  const handleBuildCustomAssessment = () => {
    // Go directly to template selector for custom building
    actions.setSkillsTestViewState('template_selector');
  };

  const handleTemplateSelect = (template: SkillsTestTemplate | null) => {
    if (template) {
      const questionsWithIds = template.questions.map((q, index) => ({
        ...q,
        id: crypto.randomUUID(),
        order: index + 1
      }));

      const updatedData: SkillsTestData = {
        ...skillsTestData,
        mode: 'custom_builder',
        questions: questionsWithIds,
        estimatedCompletionTime: template.estimatedTime
      };
      
      onSkillsTestDataChange(updatedData);
    } else {
      // Start with empty custom template
      const updatedData: SkillsTestData = {
        ...skillsTestData,
        mode: 'custom_builder',
        questions: [],
        estimatedCompletionTime: 0
      };
      onSkillsTestDataChange(updatedData);
    }
    
    actions.setSkillsTestViewState('editor');
  };

  const handlePreview = () => {
    actions.setSkillsTestViewState('preview');
  };

  const handleBackToEditor = () => {
    actions.setSkillsTestViewState('editor');
  };

  const handleBackToTemplateSelector = () => {
    actions.setSkillsTestViewState('template_selector');
  };

  const handleBackToInitial = () => {
    // Clear questions and reset to initial state for a fresh start
    const clearedData: SkillsTestData = {
      ...skillsTestData,
      questions: [],
      estimatedCompletionTime: 0,
      mode: 'ai_generated'
    };
    onSkillsTestDataChange(clearedData);
    actions.setSkillsTestViewState('initial');
  };

  // Render based on current view state
  switch (skillsTestViewState) {
    case 'template_selector':
      return (
        <SkillsTestTemplateSelector
          onSelectTemplate={handleTemplateSelect}
          onBack={handleBackToInitial}
        />
      );

    case 'preview':
      return (
        <SkillsTestPreview
          skillsTestData={skillsTestData}
          onBack={handleBackToEditor}
        />
      );

    case 'editor':
      return (
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Skills Assessment Builder
                </CardTitle>
                <Badge variant="outline" className="text-xs text-gray-600 bg-gray-50">
                  Optional
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    const updatedData = { ...skillsTestData, mode: 'ai_generated' as const };
                    onSkillsTestDataChange(updatedData);
                    await onGenerateQuestions();
                  }}
                  disabled={isGenerating}
                  className="text-xs h-8 px-3"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <CustomSpinningLogo size={16} animationSpeed="fast" />
                      Regenerating...
                    </div>
                  ) : (
                    'Regenerate with AI'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBackToInitial}
                  className="text-xs h-8 px-3"
                >
                  Start Over
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4">
            <EnhancedSkillsQuestionEditor
              skillsTestData={skillsTestData}
              onChange={onSkillsTestDataChange}
              onPreview={handlePreview}
            />
          </CardContent>
        </Card>
      );

    default: // 'initial'
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
                {isGenerating ? (
                  <CustomSpinningLogo size={48} animationSpeed="fast" />
                ) : (
                  <Sparkles className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Skills Assessment
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Choose how you'd like to create your skills assessment. You can generate questions with AI or build a custom assessment from templates.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleGenerateWithAI}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="default"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <CustomSpinningLogo size={16} animationSpeed="fast" />
                      Generating...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleBuildCustomAssessment}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  size="default"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Build Custom Assessment
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
};
