
import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpStepIndicator } from "@/components/signup/SignUpStepIndicator";
import { BasicInfoStep } from "@/components/signup/steps/BasicInfoStep";
import { CompanyInfoStep } from "@/components/signup/steps/CompanyInfoStep";
import { UseCaseStep } from "@/components/signup/steps/UseCaseStep";
import { WelcomeStep } from "@/components/signup/steps/WelcomeStep";
import { SignupErrorBoundary } from "@/components/signup/SignupErrorBoundary";
import { useNavigate } from "react-router-dom";
import { useSignupReducer } from "@/hooks/useSignupReducer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SignUpFormData {
  // Basic info
  fullName: string;
  email: string;
  password: string;
  
  // Company info
  companyName: string;
  companySize: string;
  industry: string;
  
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
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    formData,
    stepValidation,
    currentStep,
    updateFormData,
    updateStepValidation,
    setCurrentStep,
    resetForm
  } = useSignupReducer();

  const handleNext = useCallback(() => {
    try {
      console.log('handleNext called:', { currentStep, stepValidation, isProcessing });
      
      if (currentStep < STEPS.length - 1 && !isProcessing) {
        if (stepValidation[currentStep]) {
          console.log(`Moving from step ${currentStep} to step ${currentStep + 1}`);
          setCurrentStep(currentStep + 1);
        } else {
          console.warn(`Step ${currentStep} is not valid, cannot proceed`);
          toast({
            title: "Please complete all required fields",
            description: "Make sure all fields are filled correctly before continuing.",
            variant: "destructive",
          });
        }
      } else {
        console.warn('Cannot proceed:', { currentStep, isProcessing, maxStep: STEPS.length - 1 });
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      toast({
        title: "Navigation Error",
        description: "There was an issue moving to the next step. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentStep, stepValidation, isProcessing, setCurrentStep, toast]);

  const handleBack = useCallback(() => {
    try {
      if (currentStep > 0 && !isProcessing) {
        console.log(`Moving back from step ${currentStep} to step ${currentStep - 1}`);
        setCurrentStep(currentStep - 1);
      }
    } catch (error) {
      console.error('Error in handleBack:', error);
      toast({
        title: "Navigation Error", 
        description: "There was an issue going back. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentStep, isProcessing, setCurrentStep, toast]);

  const handleSignInRedirect = () => {
    if (!isProcessing) {
      navigate('/auth');
    }
  };

  const createAccount = async () => {
    setIsProcessing(true);
    try {
      console.log('Creating account with data:', formData);

      // Sign up the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
            company_size: formData.companySize,
            industry: formData.industry,
            hiring_goals: formData.hiringGoals,
            hires_per_month: formData.hiresPerMonth,
            current_tools: formData.currentTools,
            biggest_challenges: formData.biggestChallenges,
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      console.log('Account created successfully:', data);

      // Show success message
      toast({
        title: "Account created successfully!",
        description: "Welcome to Atract. Let's get you started with your first job posting.",
      });

    } catch (error: any) {
      console.error('Account creation error:', error);
      toast({
        title: "Account creation failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to be handled by WelcomeStep
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    navigate('/jobs');
  };

  const handleReset = () => {
    resetForm();
    setIsProcessing(false);
  };

  const renderCurrentStep = () => {
    const commonProps = {
      formData,
      onFormDataChange: updateFormData,
      onNext: handleNext,
      isLoading: isProcessing
    };

    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            {...commonProps}
            onValidationChange={(isValid) => updateStepValidation(0, isValid)}
          />
        );
      case 1:
        return (
          <CompanyInfoStep
            {...commonProps}
            onValidationChange={(isValid) => updateStepValidation(1, isValid)}
          />
        );
      case 2:
        return (
          <UseCaseStep
            {...commonProps}
            onValidationChange={(isValid) => updateStepValidation(2, isValid)}
          />
        );
      case 3:
        return (
          <WelcomeStep
            formData={formData}
            onComplete={handleComplete}
            onCreateAccount={createAccount}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <SignupErrorBoundary onReset={handleReset}>
      <div className="light min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Start Your Free Trial
            </h1>
            <p className="text-muted-foreground">
              Join 500+ companies hiring smarter with Atract
            </p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
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
          <Card className="mt-8 shadow-xl border-0 bg-card">
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
                disabled={currentStep === 0 || isProcessing}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={handleSignInRedirect}
                  className="text-primary hover:text-primary/80 font-medium disabled:opacity-50"
                  disabled={isProcessing}
                >
                  Sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SignupErrorBoundary>
  );
};

export default SignUp;
