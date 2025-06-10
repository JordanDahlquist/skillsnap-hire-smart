
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpStepIndicator } from "@/components/signup/SignUpStepIndicator";
import { BasicInfoStep } from "@/components/signup/steps/BasicInfoStep";
import { CompanyInfoStep } from "@/components/signup/steps/CompanyInfoStep";
import { UseCaseStep } from "@/components/signup/steps/UseCaseStep";
import { WelcomeStep } from "@/components/signup/steps/WelcomeStep";
import { useNavigate } from "react-router-dom";

export interface SignUpFormData {
  // Basic info
  fullName: string;
  email: string;
  password: string;
  
  // Company info
  companyName: string;
  companySize: string;
  industry: string;
  jobTitle: string;
  
  // Use case
  hiringGoals: string[];
  hiresPerMonth: string;
  currentTools: string[];
  biggestChallenges: string[];
}

const STEPS = [
  { id: 'basic', title: 'Account Setup', description: 'Your basic information' },
  { id: 'company', title: 'Company Details', description: 'Tell us about your company' },
  { id: 'usecase', title: 'Hiring Goals', description: 'How we can help you' },
  { id: 'welcome', title: 'Welcome', description: 'You\'re all set!' }
];

const SignUp = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    companySize: "",
    industry: "",
    jobTitle: "",
    hiringGoals: [],
    hiresPerMonth: "",
    currentTools: [],
    biggestChallenges: []
  });

  const [stepValidation, setStepValidation] = useState<boolean[]>([false, false, false, false]);

  const updateFormData = (updates: Partial<SignUpFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateStepValidation = (stepIndex: number, isValid: boolean) => {
    setStepValidation(prev => {
      const newValidation = [...prev];
      newValidation[stepIndex] = isValid;
      return newValidation;
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1 && stepValidation[currentStep]) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignInRedirect = () => {
    navigate('/auth');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            formData={formData}
            onFormDataChange={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(0, isValid)}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <CompanyInfoStep
            formData={formData}
            onFormDataChange={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(1, isValid)}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <UseCaseStep
            formData={formData}
            onFormDataChange={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(2, isValid)}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <WelcomeStep
            formData={formData}
            onComplete={() => navigate('/jobs')}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Start Your Free Trial
          </h1>
          <p className="text-gray-600">
            Join 500+ companies hiring smarter with Atract
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
        </div>

        {/* Step Indicator */}
        <SignUpStepIndicator 
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={stepValidation}
        />

        {/* Main Card */}
        <Card className="mt-8 shadow-xl border-0">
          <CardContent className="p-8">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < STEPS.length - 1 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="text-sm text-gray-500">
              Already have an account?{" "}
              <button
                onClick={handleSignInRedirect}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
