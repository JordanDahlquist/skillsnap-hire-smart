
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Zap } from "lucide-react";

interface NavigationFooterProps {
  currentStep: number;
  totalSteps: number;
  canProceedToStep2: boolean;
  canProceedToStep3: boolean;
  canProceedToStep4: boolean;
  canProceedToStep5: boolean;
  canActivate: boolean;
  isSaving: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSaveJob: (status: 'draft' | 'active') => void;
}

export const NavigationFooter = ({
  currentStep,
  totalSteps,
  canProceedToStep2,
  canProceedToStep3,
  canProceedToStep4,
  canProceedToStep5,
  canActivate,
  isSaving,
  onPrevStep,
  onNextStep,
  onSaveJob
}: NavigationFooterProps) => {
  const getCanProceed = () => {
    switch (currentStep) {
      case 1: return canProceedToStep2;
      case 2: return canProceedToStep3;
      case 3: return canProceedToStep4;
      case 4: return canProceedToStep5;
      default: return false;
    }
  };

  const getNextButtonText = () => {
    switch (currentStep) {
      case 1: return "Next";
      case 2: return "Create Skills Test";
      case 3: return "Add Interview Questions";
      case 4: return "Review & Publish";
      default: return "Next";
    }
  };

  return (
    <div className="border-t p-3 flex-shrink-0 bg-gray-50">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onPrevStep}
          disabled={currentStep === 1 || isSaving}
          size="sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <div className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </div>

        <div className="flex gap-2">
          {currentStep === totalSteps ? (
            <>
              <Button
                onClick={() => onSaveJob('draft')}
                disabled={isSaving}
                variant="outline"
                size="sm"
              >
                <Save className="w-4 h-4 mr-1" />
                Save Draft
              </Button>
              <Button
                onClick={() => onSaveJob('active')}
                disabled={!canActivate || isSaving}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Zap className="w-4 h-4 mr-1" />
                Activate Job
              </Button>
            </>
          ) : (
            <Button
              onClick={onNextStep}
              disabled={!getCanProceed() || isSaving}
              size="sm"
            >
              {getNextButtonText()}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
