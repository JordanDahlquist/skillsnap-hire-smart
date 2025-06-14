import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log('User authenticated, checking for stored redirect URL...');
      
      // Check for stored redirect URL from LinkedIn flow
      const storedRedirectUrl = sessionStorage.getItem('auth_redirect_url');
      console.log('Stored redirect URL:', storedRedirectUrl);
      
      if (storedRedirectUrl) {
        console.log('Redirecting to stored URL:', storedRedirectUrl);
        sessionStorage.removeItem('auth_redirect_url');
        navigate(storedRedirectUrl);
      } else {
        console.log('No stored redirect URL, going to dashboard');
        navigate("/jobs");
      }
    }
  }, [user, navigate]);

  const resetForm = () => {
    setShowForgotPassword(false);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AuthHeader showForgotPassword={showForgotPassword} />

      {/* Auth Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 flex-1 bg-white">
        <Card className="w-full max-w-md bg-white border border-gray-200 shadow-sm">
          <CardContent className="bg-white">
            {showForgotPassword ? (
              <div className="space-y-4">
                <ForgotPasswordForm 
                  email={email}
                  setEmail={setEmail}
                  onBack={resetForm}
                />
              </div>
            ) : (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="signin" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <SignInForm onForgotPassword={() => setShowForgotPassword(true)} />
                </TabsContent>

                <TabsContent value="signup">
                  <SignUpForm />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Auth;
