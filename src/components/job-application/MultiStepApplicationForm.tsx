
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ApplicationStepIndicator } from "./ApplicationStepIndicator";
import { JobOverviewSection } from "./JobOverviewSection";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { SkillsAssessmentStep } from "./steps/SkillsAssessmentStep";
import { VideoInterview } from "./VideoInterview";
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

  // Dynamically generate steps based on job configuration
  const steps = useMemo(() => {
    const baseSteps = [
      { id: 'overview', title: 'Job Overview', description: 'Review the position details' },
      { id: 'personal', title: 'Personal Info', description: 'Your contact information' }
    ];

    // Add skills step only if job has generated test
    if (job.generated_test) {
      baseSteps.push({ id: 'skills', title: 'Skills Assessment', description: 'Complete the skills test' });
    }

    // Add video interview step only if job has interview questions
    if (job.generated_interview_questions) {
      baseSteps.push({ id: 'video', title: 'Video Interview', description: 'Record your responses' });
    }

    baseSteps.push({ id: 'review', title: 'Review & Submit', description: 'Final review' });

    return baseSteps;
  }, [job.generated_test, job.generated_interview_questions]);

  const [stepValidation, setStepValidation] = useState<boolean[]>(() => 
    Array(steps.length).fill(false).map((_, index) => index === 0) // First step (overview) is always valid
  );

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
    if (canGoNext && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepIndex = (stepId: string) => {
    return steps.findIndex(step => step.id === stepId);
  };

  const renderCurrentStep = () => {
    const currentStepId = steps[currentStep]?.id;

    switch (currentStepId) {
      case 'overview':
        return (
          <JobOverviewSection 
            job={job}
            onContinue={() => setCurrentStep(1)}
          />
        );
      case 'personal':
        return (
          <PersonalInfoStep
            formData={formData}
            onFormDataChange={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(currentStep, isValid)}
          />
        );
      case 'skills':
        return (
          <SkillsAssessmentStep
            job={job}
            formData={formData}
            onFormDataChange={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(currentStep, isValid)}
            onNext={handleNext}
            onBack={handlePrev}
          />
        );
      case 'video':
        return (
          <VideoInterview
            questions={job.generated_interview_questions || ""}
            maxLength={job.interview_video_max_length || 5}
            videoUrl={formData.videoUrl}
            onChange={(videoUrl) => {
              updateFormData({ videoUrl });
              updateStepValidation(currentStep, !!videoUrl);
            }}
            onNext={handleNext}
            onBack={handlePrev}
          />
        );
      case 'review':
        return (
          <ReviewSubmitStep
            job={job}
            jobId={jobId}
            formData={formData}
            onValidationChange={(isValid) => updateStepValidation(currentStep, isValid)}
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
          steps={steps}
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
          
          {currentStep < steps.length - 1 && (
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
