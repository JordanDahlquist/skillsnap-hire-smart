import { UnifiedJobCreatorActions } from "@/types/jobForm";
import { InterviewQuestionEditor } from "./interview/InterviewQuestionEditor";
import { InterviewQuestionPreview } from "./interview/InterviewQuestionPreview";
import { InterviewQuestionsData } from "@/types/interviewQuestions";
import { InterviewGeneratorInitialState } from "./interview/InterviewGeneratorInitialState";
import { InterviewGeneratorContent } from "./interview/InterviewGeneratorContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";

interface Step4InterviewGeneratorProps {
  generatedJobPost: string;
  generatedInterviewQuestions: string;
  interviewQuestionsData: InterviewQuestionsData;
  interviewQuestionsViewState: 'initial' | 'editor' | 'preview';
  isGenerating: boolean;
  isEditingInterviewQuestions: boolean;
  actions: UnifiedJobCreatorActions;
  onGenerateInterviewQuestions: () => Promise<void>;
}

export const Step4InterviewGenerator = ({
  generatedJobPost,
  generatedInterviewQuestions,
  interviewQuestionsData,
  interviewQuestionsViewState,
  isGenerating,
  isEditingInterviewQuestions,
  actions,
  onGenerateInterviewQuestions
}: Step4InterviewGeneratorProps) => {
  const hasAnyInterviewContent = Boolean(
    generatedInterviewQuestions || interviewQuestionsData.questions.length > 0
  );

  // Enhanced generate function that includes the new parameters
  const handleGenerateInterviewQuestions = async () => {
    await onGenerateInterviewQuestions();
  };

  // Render based on view state
  if (interviewQuestionsViewState === 'editor') {
    return (
      <div className="h-full">
        <Card className="h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="w-5 h-5 text-purple-600" />
              Interview Questions Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <InterviewQuestionEditor 
              interviewQuestionsData={interviewQuestionsData} 
              onInterviewQuestionsDataChange={actions.setInterviewQuestionsData} 
              onBack={() => actions.setInterviewQuestionsViewState('initial')} 
              onPreview={() => actions.setInterviewQuestionsViewState('preview')} 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (interviewQuestionsViewState === 'preview') {
    return (
      <div className="h-full">
        <Card className="h-full">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="w-5 h-5 text-purple-600" />
              Interview Questions Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <InterviewQuestionPreview 
              interviewQuestionsData={interviewQuestionsData} 
              onBack={() => actions.setInterviewQuestionsViewState('editor')} 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initial state or showing generated content
  if (!hasAnyInterviewContent) {
    return (
      <InterviewGeneratorInitialState
        isGenerating={isGenerating}
        actions={actions}
        onGenerateInterviewQuestions={handleGenerateInterviewQuestions}
      />
    );
  }

  // Show generated/structured content
  return (
    <InterviewGeneratorContent
      generatedInterviewQuestions={generatedInterviewQuestions}
      interviewQuestionsData={interviewQuestionsData}
      isEditingInterviewQuestions={isEditingInterviewQuestions}
      actions={actions}
    />
  );
};
