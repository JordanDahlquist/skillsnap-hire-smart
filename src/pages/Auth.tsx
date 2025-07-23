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
      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 flex-1 bg-white">
        <Card className="w-full max-w-lg bg-white border border-gray-200 shadow-lg rounded-xl">
          <CardContent className="bg-white p-8">
            {showForgotPassword ? (
              <div className="space-y-6">
                <ForgotPasswordForm 
                  email={email}
                  setEmail={setEmail}
                  onBack={resetForm}
                />
              </div>
            ) : (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg h-12 p-1 mb-8">
                  <TabsTrigger value="signin" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-0">
                  <SignInForm onForgotPassword={() => setShowForgotPassword(true)} />
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
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
