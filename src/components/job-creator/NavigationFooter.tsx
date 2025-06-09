
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Save } from "lucide-react";

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
  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return canProceedToStep2;
      case 2: return canProceedToStep3;
      case 3: return canProceedToStep4;
      case 4: return canProceedToStep5;
      default: return false;
    }
  };

  return (
    <div className="flex justify-between items-center p-3 border-t bg-gray-50 flex-shrink-0">
      <Button 
        variant="outline" 
        onClick={onPrevStep}
        disabled={currentStep === 1}
        size="sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <div className="flex gap-2">
        {currentStep === totalSteps ? (
          <>
            <Button 
              variant="outline"
              onClick={() => onSaveJob('draft')}
              disabled={isSaving}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={() => onSaveJob('active')}
              disabled={isSaving || !canActivate}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Publish Job
            </Button>
          </>
        ) : (
          <Button 
            onClick={onNextStep}
            disabled={!canProceedToNext() || currentStep === totalSteps}
            size="sm"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
