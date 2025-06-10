
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Rocket, Zap, Users } from "lucide-react";
import { SignUpFormData } from "@/pages/SignUp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WelcomeStepProps {
  formData: SignUpFormData;
  onComplete: () => void;
}

export const WelcomeStep = ({ formData, onComplete }: WelcomeStepProps) => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const { toast } = useToast();

  const createAccount = async () => {
    try {
      setIsCreatingAccount(true);

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
            job_title: formData.jobTitle,
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
      setAccountCreated(true);

      // Show success message
      toast({
        title: "Account created successfully!",
        description: "Welcome to Atract. Let's get you started with your first job posting.",
      });

      // Wait a moment then redirect
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error: any) {
      console.error('Account creation error:', error);
      toast({
        title: "Account creation failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  useEffect(() => {
    // Auto-create account when this step loads
    createAccount();
  }, []);

  if (isCreatingAccount) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Creating Your Account
        </h2>
        <p className="text-gray-600 mb-8">
          We're setting up your personalized hiring workspace...
        </p>
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-700">Setting up your profile</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-700">Configuring hiring preferences</span>
          </div>
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <span className="text-sm text-gray-700">Preparing your dashboard</span>
          </div>
        </div>
      </div>
    );
  }

  if (accountCreated) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Atract! 🎉
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Your account has been created successfully. Let's start revolutionizing your hiring process!
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Job Creation</h3>
            <p className="text-sm text-gray-600">Create compelling job posts in seconds with our AI assistant</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-xl">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Screening</h3>
            <p className="text-sm text-gray-600">Filter out 90% of unqualified candidates automatically</p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-xl">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Scout AI</h3>
            <p className="text-sm text-gray-600">Find and engage top candidates proactively</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Redirecting you to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Ready to Get Started!
      </h2>
      <p className="text-gray-600 mb-8 text-lg">
        Everything looks good. Let's create your account and get you hiring smarter.
      </p>

      <Button
        onClick={createAccount}
        className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg font-semibold"
      >
        Create Account & Continue
      </Button>
    </div>
  );
};
