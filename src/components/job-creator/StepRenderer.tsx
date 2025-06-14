
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2JobPostGenerator } from "./Step2JobPostGenerator";
import { Step3SkillsTestGenerator } from "./Step3SkillsTestGenerator";
import { Step4InterviewGenerator } from "./Step4InterviewGenerator";
import { Step5ReviewPublish } from "./Step5ReviewPublish";
import { UnifiedJobCreatorState, UnifiedJobCreatorActions } from "@/types/jobForm";

interface StepRendererProps {
  currentStep: number;
  state: UnifiedJobCreatorState;
  actions: UnifiedJobCreatorActions;
  onGenerateJobPost: () => Promise<void>;
  onGenerateSkillsQuestions: () => Promise<void>;
  onGenerateInterviewQuestions: () => Promise<void>;
}

export const StepRenderer = ({
  currentStep,
  state,
  actions,
  onGenerateJobPost,
  onGenerateSkillsQuestions,
  onGenerateInterviewQuestions
}: StepRendererProps) => {
  switch (currentStep) {
    case 1:
      return (
        <Step1BasicInfo
          formData={state.formData}
          actions={actions}
        />
      );
    case 2:
      return (
        <Step2JobPostGenerator
          generatedJobPost={state.generatedJobPost}
          isGenerating={state.isGenerating}
          isEditingJobPost={state.isEditingJobPost}
          actions={actions}
          onGenerateJobPost={onGenerateJobPost}
        />
      );
    case 3:
      return (
        <Step3SkillsTestGenerator
          generatedJobPost={state.generatedJobPost}
          skillsTestData={state.skillsTestData}
          skillsTestViewState={state.skillsTestViewState}
          isGenerating={state.isGenerating}
          actions={actions}
          onGenerateQuestions={onGenerateSkillsQuestions}
          onSkillsTestDataChange={actions.setSkillsTestData}
        />
      );
    case 4:
      return (
        <Step4InterviewGenerator
          generatedJobPost={state.generatedJobPost}
          generatedInterviewQuestions={state.generatedInterviewQuestions}
          interviewVideoMaxLength={state.interviewVideoMaxLength}
          isGenerating={state.isGenerating}
          isEditingInterviewQuestions={state.isEditingInterviewQuestions}
          actions={actions}
          onGenerateInterviewQuestions={onGenerateInterviewQuestions}
        />
      );
    case 5:
      return (
        <Step5ReviewPublish
          formData={state.formData}
          pdfFileName={null}
          useOriginalPdf={null}
          generatedJobPost={state.generatedJobPost}
          generatedSkillsTest={state.skillsTestData.questions.length > 0 ? JSON.stringify(state.skillsTestData) : ""}
          generatedInterviewQuestions={state.generatedInterviewQuestions}
          interviewVideoMaxLength={state.interviewVideoMaxLength}
          actions={actions}
        />
      );
    default:
      return null;
  }
};
