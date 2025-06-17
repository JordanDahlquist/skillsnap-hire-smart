
import { UnifiedJobCreatorActions } from "@/types/jobForm";
import { InterviewQuestionEditor } from "./interview/InterviewQuestionEditor";
import { InterviewQuestionPreview } from "./interview/InterviewQuestionPreview";
import { InterviewQuestionsData } from "@/types/interviewQuestions";
import { InterviewGeneratorInitialState } from "./interview/InterviewGeneratorInitialState";
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
  // Render based on view state - unified flow for AI and custom
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

  // Initial state - both AI generation and custom building start here
  return (
    <InterviewGeneratorInitialState
      isGenerating={isGenerating}
      actions={actions}
      onGenerateInterviewQuestions={onGenerateInterviewQuestions}
    />
  );
};
