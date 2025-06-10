
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSignupForm } from "@/components/signup/useSignupForm";
import { SignupFormFields } from "@/components/signup/SignupFormFields";
import { Footer } from "@/components/Footer";

const SimpleSignUp = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    isLoading,
    passwordRequirements,
    handleInputChange,
    handleSubmit
  } = useSignupForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Start Your Free Trial
            </h1>
            <p className="text-gray-600">
              Transform your hiring process with AI-powered recruitment
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <SignupFormFields
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  passwordRequirements={passwordRequirements}
                  onInputChange={handleInputChange}
                />

                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    className="w-full max-w-md py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Your Account..." : "Create Account & Start Free Trial"}
                  </Button>
                </div>
              </form>

              <p className="text-xs text-gray-500 text-center mt-6">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>

              <div className="text-center mt-6">
                <span className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Sign in
                  </button>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SimpleSignUp;
