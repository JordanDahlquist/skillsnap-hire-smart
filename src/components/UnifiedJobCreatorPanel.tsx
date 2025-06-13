import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UnifiedJobCreatorPanelProps } from "@/types/jobForm";
import { StepIndicator } from "./job-creator/StepIndicator";
import { NavigationFooter } from "./job-creator/NavigationFooter";
import { StepRenderer } from "./job-creator/StepRenderer";
import { useUnifiedJobCreator } from "@/hooks/useUnifiedJobCreator";

export const UnifiedJobCreatorPanel = ({ 
  open, 
  onOpenChange, 
  onJobCreated, 
  editingJob 
}: UnifiedJobCreatorPanelProps) => {
  const {
    state,
    actions,
    handleGenerateJobPost,
    handleGenerateSkillsQuestions,
    handleGenerateInterviewQuestions,
    handleSaveJob
  } = useUnifiedJobCreator(onJobCreated, onOpenChange, editingJob);

  // Populate form when editing a job
  useEffect(() => {
    if (editingJob && open) {
      actions.populateFormFromJob(editingJob);
    } else if (!editingJob && open) {
      // Reset to creation mode
      actions.setEditMode(false);
    }
  }, [editingJob, open, actions]);

  const nextStep = () => {
    if (state.currentStep < 5) actions.setCurrentStep(state.currentStep + 1);
  };

  const prevStep = () => {
    if (state.currentStep > 1) actions.setCurrentStep(state.currentStep - 1);
  };

  const canProceedToStep2 = Boolean(state.formData.title && state.formData.description);
  const canProceedToStep3 = Boolean(state.generatedJobPost);
  const canProceedToStep4 = Boolean(state.generatedJobPost);
  const canProceedToStep5 = Boolean(state.generatedJobPost);
  const canActivate = Boolean(state.generatedJobPost);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {state.isEditMode ? `Edit Job: ${state.formData.title || 'Untitled'}` : 'Create New Job'}
            </h2>
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
            onGenerateSkillsQuestions={handleGenerateSkillsQuestions}
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
          onPrevStep={() => {
            if (state.currentStep > 1) actions.setCurrentStep(state.currentStep - 1);
          }}
          onNextStep={() => {
            if (state.currentStep < 5) actions.setCurrentStep(state.currentStep + 1);
          }}
          onSaveJob={handleSaveJob}
        />
      </div>
    </div>
  );
};
