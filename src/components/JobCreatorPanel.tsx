import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, ArrowRight, Sparkles, Save } from "lucide-react";
import { Step1BasicInfo } from "./job-creator/Step1BasicInfo";
import { Step2JobPostGenerator } from "./job-creator/Step2JobPostGenerator";
import { Step3SkillsTestGenerator } from "./job-creator/Step3SkillsTestGenerator";
import { Step4ReviewPublish } from "./job-creator/Step4ReviewPublish";
import { 
  JobCreatorPanelProps, 
  JobCreatorState, 
  JobCreatorActions,
  JobFormData 
} from "./job-creator/types";
import { 
  generateJobPost, 
  generateSkillsTest, 
  saveJob, 
  getInitialFormData 
} from "./job-creator/utils";

export const JobCreatorPanel = ({ open, onOpenChange, onJobCreated }: JobCreatorPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [state, setState] = useState<JobCreatorState>({
    currentStep: 1,
    isGenerating: false,
    isSaving: false,
    formData: getInitialFormData(),
    uploadedPdfContent: null,
    pdfFileName: null,
    useOriginalPdf: null,
    generatedJobPost: "",
    generatedSkillsTest: "",
    isEditingJobPost: false,
    isEditingSkillsTest: false,
  });

  // Actions for state management
  const actions: JobCreatorActions = {
    setCurrentStep: (step: number) => setState(prev => ({ ...prev, currentStep: step })),
    setIsGenerating: (loading: boolean) => setState(prev => ({ ...prev, isGenerating: loading })),
    setIsSaving: (saving: boolean) => setState(prev => ({ ...prev, isSaving: saving })),
    updateFormData: (field: keyof JobFormData, value: string) => 
      setState(prev => ({ ...prev, formData: { ...prev.formData, [field]: value } })),
    setUploadedPdfContent: (content: string | null) => 
      setState(prev => ({ ...prev, uploadedPdfContent: content })),
    setPdfFileName: (fileName: string | null) => 
      setState(prev => ({ ...prev, pdfFileName: fileName })),
    setUseOriginalPdf: (use: boolean | null) => 
      setState(prev => ({ ...prev, useOriginalPdf: use })),
    setGeneratedJobPost: (content: string) => 
      setState(prev => ({ ...prev, generatedJobPost: content })),
    setGeneratedSkillsTest: (content: string) => 
      setState(prev => ({ ...prev, generatedSkillsTest: content })),
    setIsEditingJobPost: (editing: boolean) => 
      setState(prev => ({ ...prev, isEditingJobPost: editing })),
    setIsEditingSkillsTest: (editing: boolean) => 
      setState(prev => ({ ...prev, isEditingSkillsTest: editing })),
  };

  const handleGenerateJobPost = async () => {
    if (!state.formData.title || (!state.formData.description && !(state.uploadedPdfContent && state.useOriginalPdf === true))) {
      toast({
        title: "Missing Information",
        description: "Please fill in the job title and description first.",
        variant: "destructive"
      });
      return;
    }

    actions.setIsGenerating(true);
    try {
      const data = await generateJobPost(
        state.formData, 
        state.uploadedPdfContent, 
        state.useOriginalPdf
      );
      
      actions.setGeneratedJobPost(data.jobPost);
      
      // Improved toast messages based on the actual workflow
      if (state.uploadedPdfContent && state.useOriginalPdf === true) {
        toast({
          title: "Original Content Ready!",
          description: "Using your uploaded PDF content as the job post."
        });
      } else if (state.uploadedPdfContent && state.useOriginalPdf === false) {
        toast({
          title: "Job Post Generated!",
          description: "AI has rewritten your PDF content into a professional job posting."
        });
      } else {
        toast({
          title: "Job Post Generated!",
          description: "Your AI-powered job posting is ready for review."
        });
      }
    } catch (error) {
      console.error('Error generating job post:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate job post. Please try again.",
        variant: "destructive"
      });
    } finally {
      actions.setIsGenerating(false);
    }
  };

  const handleGenerateSkillsTest = async () => {
    if (!state.generatedJobPost) {
      toast({
        title: "Generate Job Post First",
        description: "Please generate the job post before creating the skills test.",
        variant: "destructive"
      });
      return;
    }

    actions.setIsGenerating(true);
    try {
      const data = await generateSkillsTest(state.generatedJobPost);
      actions.setGeneratedSkillsTest(data.test);
      toast({
        title: "Skills Test Generated!",
        description: "Your AI-powered skills assessment is ready for review."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate skills test. Please try again.",
        variant: "destructive"
      });
    } finally {
      actions.setIsGenerating(false);
    }
  };

  const handleSaveJob = async (status: 'draft' | 'active') => {
    if (!user?.id) return;

    actions.setIsSaving(true);
    try {
      await saveJob(
        user.id,
        state.formData,
        state.generatedJobPost,
        state.generatedSkillsTest,
        status
      );

      toast({
        title: status === 'active' ? "Job Published!" : "Job Saved!",
        description: status === 'active' 
          ? "Your job posting is now live and accepting applications."
          : "Your job has been saved as a draft."
      });

      onJobCreated?.();
      onOpenChange(false);
      
      // Reset state
      setState({
        currentStep: 1,
        isGenerating: false,
        isSaving: false,
        formData: getInitialFormData(),
        uploadedPdfContent: null,
        pdfFileName: null,
        useOriginalPdf: null,
        generatedJobPost: "",
        generatedSkillsTest: "",
        isEditingJobPost: false,
        isEditingSkillsTest: false,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save job. Please try again.",
        variant: "destructive"
      });
    } finally {
      actions.setIsSaving(false);
    }
  };

  const nextStep = () => {
    // Special case: Skip Step 2 if using original PDF content
    if (state.currentStep === 1 && state.uploadedPdfContent && state.useOriginalPdf === true) {
      // Set the job post content directly from PDF
      actions.setGeneratedJobPost(state.uploadedPdfContent);
      actions.setCurrentStep(3);
      toast({
        title: "Using Original Content",
        description: "Skipping AI generation, proceeding to skills test creation."
      });
      return;
    }
    
    if (state.currentStep < 4) actions.setCurrentStep(state.currentStep + 1);
  };

  const prevStep = () => {
    // Special case: If we're on Step 3 and came from Step 1 (skipped Step 2), go back to Step 1
    if (state.currentStep === 3 && state.uploadedPdfContent && state.useOriginalPdf === true) {
      actions.setCurrentStep(1);
      return;
    }
    
    if (state.currentStep > 1) actions.setCurrentStep(state.currentStep - 1);
  };

  const canProceedToStep2 = state.formData.title && (state.formData.description || (state.uploadedPdfContent && state.useOriginalPdf === true));
  const canProceedToStep3 = state.generatedJobPost || (state.uploadedPdfContent && state.useOriginalPdf === true);
  const canActivate = state.generatedJobPost && state.generatedSkillsTest;

  if (!open) return null;

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            formData={state.formData}
            uploadedPdfContent={state.uploadedPdfContent}
            pdfFileName={state.pdfFileName}
            useOriginalPdf={state.useOriginalPdf}
            actions={actions}
          />
        );
      case 2:
        return (
          <Step2JobPostGenerator
            formData={state.formData}
            uploadedPdfContent={state.uploadedPdfContent}
            useOriginalPdf={state.useOriginalPdf}
            generatedJobPost={state.generatedJobPost}
            isGenerating={state.isGenerating}
            isEditingJobPost={state.isEditingJobPost}
            actions={actions}
            onGenerateJobPost={handleGenerateJobPost}
          />
        );
      case 3:
        return (
          <Step3SkillsTestGenerator
            generatedJobPost={state.generatedJobPost}
            generatedSkillsTest={state.generatedSkillsTest}
            isGenerating={state.isGenerating}
            isEditingSkillsTest={state.isEditingSkillsTest}
            actions={actions}
            onGenerateSkillsTest={handleGenerateSkillsTest}
          />
        );
      case 4:
        return (
          <Step4ReviewPublish
            formData={state.formData}
            pdfFileName={state.pdfFileName}
            useOriginalPdf={state.useOriginalPdf}
            generatedJobPost={state.generatedJobPost}
            generatedSkillsTest={state.generatedSkillsTest}
            actions={actions}
          />
        );
      default:
        return null;
    }
  };

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
        <div className="flex items-center justify-center py-2 px-4 border-b flex-shrink-0">
          {[1, 2, 3, 4].map((step) => {
            const isCompleted = state.currentStep >= step || 
              (step === 2 && state.uploadedPdfContent && state.useOriginalPdf === true && state.currentStep >= 3);
            
            return (
              <div key={step} className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-8 h-1 mx-1 ${
                    state.currentStep > step || (step === 2 && state.uploadedPdfContent && state.useOriginalPdf === true && state.currentStep >= 3)
                      ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-3">
          {renderCurrentStep()}
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center p-3 border-t bg-gray-50 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={state.currentStep === 1}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {state.currentStep === 4 ? (
              <>
                <Button 
                  variant="outline"
                  onClick={() => handleSaveJob('draft')}
                  disabled={state.isSaving}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  onClick={() => handleSaveJob('active')}
                  disabled={state.isSaving || !canActivate}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Publish Job
                </Button>
              </>
            ) : (
              <Button 
                onClick={nextStep}
                disabled={
                  (state.currentStep === 1 && !canProceedToStep2) ||
                  (state.currentStep === 2 && !canProceedToStep3) ||
                  state.currentStep === 4
                }
                size="sm"
              >
                {state.currentStep === 1 && state.uploadedPdfContent && state.useOriginalPdf === true ? 'Skip to Skills Test' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
