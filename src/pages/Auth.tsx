import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, ArrowLeft, ArrowRight, Eye, EyeOff, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Footer } from "@/components/Footer";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup form fields
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  const { toast } = useToast();
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

  // Password requirements for signup
  const passwordRequirements = [
    { text: "At least 8 characters", met: signupPassword.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(signupPassword) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(signupPassword) },
    { text: "Contains number", met: /\d/.test(signupPassword) },
  ];

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) throw error;

      // Note: The actual redirect happens automatically, so we don't need to handle success here
      // The user will be redirected to the callback URL and then to the app
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "Google sign in failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });

      // Check for stored redirect URL
      const storedRedirectUrl = sessionStorage.getItem('auth_redirect_url');
      if (storedRedirectUrl) {
        console.log('Sign in successful, redirecting to stored URL:', storedRedirectUrl);
        sessionStorage.removeItem('auth_redirect_url');
        navigate(storedRedirectUrl);
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast({
        title: "Full name required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter your company name.",
        variant: "destructive",
      });
      return;
    }

    if (!signupEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordRequirements.every(req => req.met)) {
      toast({
        title: "Password requirements not met",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            company_name: companyName
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created successfully!",
        description: "Please check your email to confirm your account.",
      });

      // Redirect to email confirmation page
      const confirmParams = new URLSearchParams({
        email: signupEmail,
        name: fullName
      });
      navigate(`/confirm-email?${confirmParams.toString()}`);

    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setEmail("");
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/fcccb8be-0469-47e0-abd3-15729af8467e.png" 
                  alt="Atract"
                  className="w-6 h-6"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">Atract</span>
            </Link>
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Mail className="w-6 h-6 text-[#007af6]" />
              {showForgotPassword ? "Reset Password" : "Welcome to Atract"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <div className="space-y-4">
                {resetEmailSent ? (
                  <div className="text-center space-y-4">
                    <div className="text-green-600 text-sm">
                      Password reset email sent! Check your inbox and follow the instructions to reset your password.
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={resetForm}
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="text-sm text-gray-600 text-center">
                      Enter your email address and we'll send you a link to reset your password.
                    </div>
                    <div>
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#007af6] hover:bg-[#0056b3]" 
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Send Reset Email
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Sign In
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <div className="space-y-4">
                    {/* Google Sign In Button */}
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                      className="w-full border-gray-300 hover:bg-gray-50"
                    >
                      {googleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      Continue with Google
                    </Button>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    {/* Email Sign In Form */}
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div>
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signin-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-[#007af6] hover:bg-[#0056b3]" 
                        disabled={loading || googleLoading}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Sign In
                      </Button>
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-[#007af6] hover:text-[#0056b3]"
                        >
                          Forgot your password?
                        </Button>
                      </div>
                    </form>
                  </div>
                </TabsContent>

                <TabsContent value="signup">
                  <div className="space-y-4">
                    {/* Google Sign Up Button */}
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                      className="w-full border-gray-300 hover:bg-gray-50"
                    >
                      {googleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      Sign up with Google
                    </Button>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                          Or sign up with
                        </span>
                      </div>
                    </div>

                    {/* Email Sign Up Form */}
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div>
                        <Label htmlFor="signup-fullname">Full Name</Label>
                        <Input
                          id="signup-fullname"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-company">Company Name</Label>
                        <Input
                          id="signup-company"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Your company name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-email">Work Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="your.email@company.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showSignupPassword ? "text" : "password"}
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            placeholder="Create a strong password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        {signupPassword && (
                          <div className="mt-2 space-y-1">
                            {passwordRequirements.map((req, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                {req.met ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <X className="w-3 h-3 text-gray-300" />
                                )}
                                <span className={req.met ? "text-green-600" : "text-gray-500"}>
                                  {req.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-[#007af6] hover:bg-[#0056b3]" 
                        disabled={loading || googleLoading}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Create Account & Start Free Trial
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </form>
                  </div>
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
