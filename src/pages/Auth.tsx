
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
        console.log('No stored redirect URL, going to home page');
        navigate("/");
      }
    }
  }, [user, navigate]);

  const resetForm = () => {
    setShowForgotPassword(false);
    setEmail("");
  };

  return (
    <div className="light min-h-screen bg-background flex flex-col">
      <AuthHeader showForgotPassword={showForgotPassword} />

      {/* Auth Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent>
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
