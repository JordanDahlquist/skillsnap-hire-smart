
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
    console.log('UnifiedJobCreatorPanel useEffect triggered:', { editingJob: !!editingJob, open, isEditMode: state.isEditMode });
    
    if (editingJob && open && !state.isEditMode) {
      console.log('Populating form with editing job:', editingJob);
      actions.populateFormFromJob(editingJob);
    } else if (!editingJob && open && state.isEditMode) {
      // Reset to creation mode when no job is being edited
      console.log('Resetting to creation mode');
      actions.setEditMode(false);
    }
  }, [editingJob, open, actions, state.isEditMode]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Form data updated:', state.formData);
  }, [state.formData]);

  const handleNextStep = async () => {
    // Handle Step 1 → Step 2 transition with automatic website analysis
    if (state.currentStep === 1) {
      // Move to step 2 first
      actions.setCurrentStep(2);
      
      // Trigger website analysis if URL is provided and we haven't analyzed yet
      if (state.formData.companyWebsite && !state.websiteAnalysisData && !state.isAnalyzingWebsite) {
        await actions.analyzeWebsite(state.formData.companyWebsite);
      }
    } else if (state.currentStep === 2) {
      if (!state.generatedJobPost && state.formData.title && state.formData.companyName) {
        handleGenerateJobPost();
      }
      actions.setCurrentStep(state.currentStep + 1);
    } else if (state.currentStep === 3) {
      // Auto-save job post edits when moving forward from the editor step
      if (state.isEditingJobPost) {
        actions.setIsEditingJobPost(false);
      }
      actions.setCurrentStep(state.currentStep + 1);
    } else if (state.currentStep < 6) {
      actions.setCurrentStep(state.currentStep + 1);
    }
  };
  const prevStep = () => {
    if (state.currentStep > 1) actions.setCurrentStep(state.currentStep - 1);
  };

  // Updated validation for 6-step process
  const canProceedToStep2 = Boolean(state.formData.jobOverview.trim());
  const canProceedToStep3 = Boolean(
    state.formData.title && 
    state.formData.companyName && 
    state.formData.locationType
  );
  const canProceedToStep4 = Boolean(state.generatedJobPost);
  const canProceedToStep5 = Boolean(state.generatedJobPost);
  const canProceedToStep6 = Boolean(state.generatedJobPost);
  const canActivate = Boolean(state.generatedJobPost);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] min-h-[70vh] flex flex-col relative shadow-2xl">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold truncate">
              {state.isEditMode ? `Edit Job: ${state.formData.title || 'Untitled'}` : 'Create New Job'}
            </h2>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={state.currentStep} totalSteps={6} />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
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
          totalSteps={6}
          canProceedToStep2={canProceedToStep2}
          canProceedToStep3={canProceedToStep3}
          canProceedToStep4={canProceedToStep4}
          canProceedToStep5={canProceedToStep5}
          canProceedToStep6={canProceedToStep6}
          canActivate={canActivate}
          isSaving={state.isSaving}
          isAnalyzingWebsite={state.isAnalyzingWebsite}
          onPrevStep={prevStep}
          onNextStep={handleNextStep}
          onSaveJob={handleSaveJob}
        />
      </div>
    </div>
  );
};
