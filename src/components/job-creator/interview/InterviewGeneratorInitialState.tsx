
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Edit3, SkipForward, Video } from "lucide-react";
import { CustomSpinningLogo } from "@/components/CustomSpinningLogo";
import { UnifiedJobCreatorActions } from "@/types/jobForm";

interface InterviewGeneratorInitialStateProps {
  isGenerating: boolean;
  actions: UnifiedJobCreatorActions;
  onGenerateInterviewQuestions: () => Promise<void>;
}

export const InterviewGeneratorInitialState = ({
  isGenerating,
  actions,
  onGenerateInterviewQuestions
}: InterviewGeneratorInitialStateProps) => {
  const handleModeSelect = (mode: 'ai_generated' | 'custom') => {
    if (mode === 'ai_generated') {
      onGenerateInterviewQuestions();
    } else if (mode === 'custom') {
      actions.setInterviewQuestionsData({
        questions: [],
        mode: 'custom'
      });
      actions.setInterviewQuestionsViewState('editor');
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Card className="h-full">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="w-5 h-5 text-purple-600" />
              Interview Questions Generator
            </CardTitle>
            <Badge variant="outline" className="text-xs text-gray-600 bg-gray-50">
              Optional
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
              {isGenerating ? (
                <CustomSpinningLogo size={48} animationSpeed="fast" />
              ) : (
                <Video className="w-8 h-8 text-purple-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create Interview Questions
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Generate targeted interview questions that candidates will answer via video submission. Each question can have its own video length limit to evaluate candidates effectively.
            </p>

            {/* Consistent Button Stack - Same as Steps 2 & 3 */}
            <div className="space-y-3">
              <Button 
                onClick={() => handleModeSelect('ai_generated')} 
                disabled={isGenerating} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isGenerating ? (
                  <CustomSpinningLogo size={16} animationSpeed="fast" className="mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate with AI
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleModeSelect('custom')} 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Build Custom Questions
              </Button>
              
              <div className="pt-3 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => actions.setCurrentStep(6)} 
                  className="w-full text-gray-600 hover:text-gray-800 border-gray-200"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip Interview Questions
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              You can always add interview questions later after publishing your job
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
