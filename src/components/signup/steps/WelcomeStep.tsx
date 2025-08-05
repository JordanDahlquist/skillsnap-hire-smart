
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Rocket, Zap, Users } from "lucide-react";
import { SignUpFormData } from "@/pages/SignUp";
import { useNavigate } from "react-router-dom";

interface WelcomeStepProps {
  formData: SignUpFormData;
  onComplete: () => void;
  onCreateAccount: () => Promise<void>;
}

export const WelcomeStep = ({ formData, onComplete, onCreateAccount }: WelcomeStepProps) => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateAccount = async () => {
    try {
      setIsCreatingAccount(true);
      setError(null);
      await onCreateAccount();
      setAccountCreated(true);
      
      // Wait a moment then redirect to confirm email page
      setTimeout(() => {
        navigate(`/confirm-email?email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.fullName)}`);
      }, 2000);
    } catch (error: any) {
      console.error('Account creation error:', error);
      
      // Handle specific error messages for better UX
      let errorMessage = error.message || "Something went wrong. Please try again.";
      
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        errorMessage = "This email is already registered. Please sign in instead or use a different email.";
      } else if (error.message?.includes('confirmation')) {
        errorMessage = "Please check your email for a confirmation link before proceeding.";
      }
      
      setError(errorMessage);
    } finally {
      setIsCreatingAccount(false);
    }
  };

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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <Button
        onClick={handleCreateAccount}
        className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg font-semibold disabled:opacity-50"
        disabled={isCreatingAccount}
      >
        {isCreatingAccount ? "Creating Account..." : "Create Account & Continue"}
      </Button>
    </div>
  );
};
