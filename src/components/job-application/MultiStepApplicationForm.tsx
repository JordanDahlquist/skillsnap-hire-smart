
import { useState } from "react";
import { Job } from "@/types";
import { ApplicationStepIndicator } from "./ApplicationStepIndicator";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { ApplicationReview } from "./ApplicationReview";

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeFile: File | null;
  resumeUrl: string | null;
  coverLetter: string;
}

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
    { number: 1, title: "Personal Info", isActive: currentStep === 1, isCompleted: currentStep > 1 },
    { number: 2, title: "Review & Submit", isActive: currentStep === 2, isCompleted: false },
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
      <ApplicationStepIndicator steps={steps} />
      
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
