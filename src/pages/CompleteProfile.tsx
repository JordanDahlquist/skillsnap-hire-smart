import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyInfoStep } from "@/components/signup/steps/CompanyInfoStep";
import { UseCaseStep } from "@/components/signup/steps/UseCaseStep";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Extended interface to match SignUpFormData for compatibility with existing components
interface CompleteProfileFormData {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  companySize: string;
  industry: string;
  hiringGoals: string[];
  hiresPerMonth: string;
  currentTools: string[];
  biggestChallenges: string[];
}

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, profile, loading } = useOptimizedAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CompleteProfileFormData>({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    companySize: "",
    industry: "",
    hiringGoals: [],
    hiresPerMonth: "",
    currentTools: [],
    biggestChallenges: [],
  });

  // Check if user is authenticated and if profile is already complete
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if profile is already complete
      if (profile && profile.company_size && profile.industry) {
        navigate('/jobs');
        return;
      }

      // Pre-fill form with existing profile data if available
      if (profile) {
        setFormData(prev => ({
          ...prev,
          companyName: profile.company_name || "",
        }));
      }
    }
  }, [user, profile, loading, navigate]);

  const handleFormDataChange = (updates: Partial<CompleteProfileFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleValidationChange = (valid: boolean) => {
    setIsValid(valid);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      setIsValid(false); // Reset validation for new step
    } else {
      handleCompleteProfile();
    }
  };

  const handleCompleteProfile = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: formData.companyName,
          company_size: formData.companySize,
          industry: formData.industry,
          hiring_goals: formData.hiringGoals,
          hires_per_month: formData.hiresPerMonth,
          current_tools: formData.currentTools,
          biggest_challenges: formData.biggestChallenges,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile completed successfully!",
        description: "Welcome to Atract. Let's start building amazing job posts.",
      });

      navigate('/jobs');
    } catch (error: any) {
      console.error('Error completing profile:', error);
      toast({
        title: "Error completing profile",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setIsValid(true); // Previous step was valid to get here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 mb-8">
            Just a few more details to personalize your experience
          </p>
          
          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {currentStep === 1 && (
            <CompanyInfoStep
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onValidationChange={handleValidationChange}
              onNext={handleNext}
              isLoading={isSubmitting}
            />
          )}

          {currentStep === 2 && (
            <div>
              <UseCaseStep
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onValidationChange={handleValidationChange}
                onNext={handleNext}
                isLoading={isSubmitting}
              />
              
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-500"
                  disabled={isSubmitting}
                >
                  ← Back to previous step
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}