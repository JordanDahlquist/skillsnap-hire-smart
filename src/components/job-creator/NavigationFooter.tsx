
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface NavigationFooterProps {
  currentStep: number;
  totalSteps: number;
  canProceedToStep2?: boolean;
  canProceedToStep3?: boolean;
  canProceedToStep4?: boolean;
  canProceedToStep5?: boolean;
  canProceedToStep6?: boolean;
  canActivate?: boolean;
  isSaving?: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSaveJob: (status: 'draft' | 'active') => Promise<void>;
}

export const NavigationFooter = ({
  currentStep,
  totalSteps,
  canProceedToStep2 = true,
  canProceedToStep3 = true,
  canProceedToStep4 = true,
  canProceedToStep5 = true,
  canProceedToStep6 = true,
  canActivate = true,
  isSaving = false,
  onPrevStep,
  onNextStep,
  onSaveJob
}: NavigationFooterProps) => {
  const canProceed = () => {
    switch (currentStep) {
      case 1: return canProceedToStep2;
      case 2: return canProceedToStep3;
      case 3: return canProceedToStep4;
      case 4: return canProceedToStep5;
      case 5: return canProceedToStep6;
      default: return true;
    }
  };

  return (
    <div className="border-t p-3 sm:p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={onPrevStep} disabled={isSaving}>
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Final step - save options */}
          {currentStep === totalSteps ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onSaveJob('draft')}
                disabled={isSaving || !canActivate}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save as Draft
              </Button>
              <Button
                onClick={() => onSaveJob('active')}
                disabled={isSaving || !canActivate}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Publish Job
              </Button>
            </div>
          ) : (
            <Button
              onClick={onNextStep}
              disabled={!canProceed() || isSaving}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
