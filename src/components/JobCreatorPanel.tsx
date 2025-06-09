
import { Button } from "@/components/ui/button";
import { JobCreatorPanelProps } from "./job-creator/types";
import { StepIndicator } from "./job-creator/StepIndicator";
import { NavigationFooter } from "./job-creator/NavigationFooter";
import { StepRenderer } from "./job-creator/StepRenderer";
import { useJobCreatorLogic } from "./job-creator/useJobCreatorLogic";

export const JobCreatorPanel = ({ open, onOpenChange, onJobCreated }: JobCreatorPanelProps) => {
  const {
    state,
    actions,
    handleGenerateJobPost,
    handleGenerateSkillsTest,
    handleGenerateInterviewQuestions,
    handleSaveJob
  } = useJobCreatorLogic(onJobCreated, onOpenChange);

  const nextStep = () => {
    if (state.currentStep < 5) actions.setCurrentStep(state.currentStep + 1);
  };

  const prevStep = () => {
    if (state.currentStep > 1) actions.setCurrentStep(state.currentStep - 1);
  };

  const canProceedToStep2 = Boolean(state.formData.title && state.formData.description);
  const canProceedToStep3 = Boolean(state.generatedJobPost);
  const canProceedToStep4 = Boolean(state.generatedJobPost); // Can proceed to interview questions if job post exists
  const canProceedToStep5 = Boolean(state.generatedJobPost); // Can proceed to review if job post exists
  const canActivate = Boolean(state.generatedJobPost); // Only require job post

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Create New Job</h2>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={state.currentStep} totalSteps={5} />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-3">
          <StepRenderer
            currentStep={state.currentStep}
            state={state}
            actions={actions}
            onGenerateJobPost={handleGenerateJobPost}
            onGenerateSkillsTest={handleGenerateSkillsTest}
            onGenerateInterviewQuestions={handleGenerateInterviewQuestions}
          />
        </div>

        {/* Navigation Footer */}
        <NavigationFooter
          currentStep={state.currentStep}
          totalSteps={5}
          canProceedToStep2={canProceedToStep2}
          canProceedToStep3={canProceedToStep3}
          canProceedToStep4={canProceedToStep4}
          canProceedToStep5={canProceedToStep5}
          canActivate={canActivate}
          isSaving={state.isSaving}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          onSaveJob={handleSaveJob}
        />
      </div>
    </div>
  );
};
