import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ApplicationStepIndicator } from "./ApplicationStepIndicator";
import { JobOverviewSection } from "./JobOverviewSection";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { SkillsAssessmentStep } from "./steps/SkillsAssessmentStep";
import { VideoInterviewStep } from "./steps/VideoInterviewStep";
import { ReviewSubmitStep } from "./steps/ReviewSubmitStep";
import { Job } from "@/types";

interface ApplicationFormData {
  // Personal Info
  name: string;
  email: string;
  portfolio: string;
  resumeUrl: string | null;
  answer1: string;
  answer2: string;
  answer3: string;
  
  // Skills Assessment
  skillsTestResponses: Array<{
    question: string;
    answer: string;
  }>;
  
  // Video Interview
  videoUrl: string | null;
}

interface MultiStepApplicationFormProps {
  job: Job;
  jobId: string;
  isApplicationOpen: boolean;
  jobStatus: string;
}

const STEPS = [
  { id: 'overview', title: 'Job Overview', description: 'Review the position details' },
  { id: 'personal', title: 'Personal Info', description: 'Your contact information' },
  { id: 'skills', title: 'Skills Assessment', description: 'Complete the skills test' },
  { id: 'video', title: 'Video Interview', description: 'Record your responses' },
  { id: 'review', title: 'Review & Submit', description: 'Final review' }
];

export const MultiStepApplicationForm = ({ 
  job, 
  jobId, 
  isApplicationOpen, 
  jobStatus 
}: MultiStepApplicationFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    email: "",
    portfolio: "",
    resumeUrl: null,
    answer1: "",
    answer2: "",
    answer3: "",
    skillsTestResponses: [],
    videoUrl: null,
  });

  const [stepValidation, setStepValidation] = useState<boolean[]>([
    true, // Job overview is always valid (just viewing)
    false, // Personal info
    false, // Skills assessment
    false, // Video interview
    false, // Review & submit
  ]);

  const updateFormData = useCallback((updates: Partial<ApplicationFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateStepValidation = useCallback((stepIndex: number, isValid: boolean) => {
    setStepValidation(prev => {
      const newValidation = [...prev];
      newValidation[stepIndex] = isValid;
      return newValidation;
    });
  }, []);

  const canGoNext = currentStep === 0 || stepValidation[currentStep];
  const canGoPrev = currentStep > 0;

  const handleNext = () => {
    if (canGoNext && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <JobOverviewSection 
            job={job}
            onContinue={() => setCurrentStep(1)}
          />
        );
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            onFormDataChange={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(1, isValid)}
          />
        );
      case 2:
        return (
          <SkillsAssessmentStep
            job={job}
            formData={formData}
            onFormDataChange={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(2, isValid)}
          />
        );
      case 3:
        return (
          <VideoInterviewStep
            job={job}
            formData={formData}
            onFormDataChange={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(3, isValid)}
          />
        );
      case 4:
        return (
          <ReviewSubmitStep
            job={job}
            jobId={jobId}
            formData={formData}
            onValidationChange={(isValid) => updateStepValidation(4, isValid)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-8">
        <ApplicationStepIndicator 
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={stepValidation}
        />
        
        <div className="mt-8">
          {renderCurrentStep()}
        </div>
        
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          {currentStep < STEPS.length - 1 && (
            <Button
              onClick={handleNext}
              disabled={!canGoNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
