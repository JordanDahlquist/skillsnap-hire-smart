
import { useState } from "react";
import { Job } from "@/types";
import { PersonalInfo } from "@/types/jobForm";
import { ApplicationStepIndicator } from "./ApplicationStepIndicator";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { ApplicationReview } from "./ApplicationReview";

interface MultiStepApplicationFormProps {
  job: Job;
  onApplicationSubmitted: () => void;
}

export const MultiStepApplicationForm = ({ job, onApplicationSubmitted }: MultiStepApplicationFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    resumeFile: null,
    resumeUrl: null,
    coverLetter: "",
  });

  const steps = [
    { 
      id: "personal-info", 
      title: "Personal Info", 
      description: "Your contact details and resume",
      number: 1, 
      isActive: currentStep === 1, 
      isCompleted: currentStep > 1 
    },
    { 
      id: "review-submit", 
      title: "Review & Submit", 
      description: "Final review and submission",
      number: 2, 
      isActive: currentStep === 2, 
      isCompleted: false 
    },
  ];

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handlePersonalInfoChange = (newInfo: PersonalInfo) => {
    setPersonalInfo(newInfo);
  };

  return (
    <div className="space-y-8">
      <ApplicationStepIndicator 
        steps={steps} 
        currentStep={currentStep - 1} 
        completedSteps={steps.map(step => step.isCompleted)} 
      />
      
      {currentStep === 1 && (
        <PersonalInfoForm
          data={personalInfo}
          onChange={handlePersonalInfoChange}
          onNext={handleNext}
          onBack={() => {}} // No back button on first step
        />
      )}

      {currentStep === 2 && (
        <ApplicationReview
          job={job}
          personalInfo={personalInfo}
          skillsResponses={[]}
          videoUrl={null}
          onBack={handleBack}
          onSubmit={onApplicationSubmitted}
        />
      )}
    </div>
  );
};
