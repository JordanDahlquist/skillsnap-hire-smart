
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSignupForm } from "@/components/signup/useSignupForm";
import { SignupFormFields } from "@/components/signup/SignupFormFields";
import { Footer } from "@/components/Footer";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";

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
    <div className="light min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Start Your Free Trial
            </h1>
            <p className="text-muted-foreground">
              Transform your hiring process with AI-powered recruitment
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-card">
            <CardContent className="p-8">
              {/* Google Authentication */}
              <div className="mb-6">
                <GoogleAuthButton mode="signup" disabled={isLoading} />
                <div className="mt-4">
                  <AuthDivider />
                </div>
              </div>

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
                    className="w-full max-w-md py-3 text-lg font-semibold bg-primary hover:bg-primary/90 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Your Account..." : "Create Account & Start Free Trial"}
                  </Button>
                </div>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-6">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>

              <div className="text-center mt-6">
                <span className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-primary hover:text-primary/80 font-medium disabled:opacity-50"
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
