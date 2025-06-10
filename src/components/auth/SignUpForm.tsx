
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { AuthDivider } from "./AuthDivider";

export const SignUpForm = () => {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Password requirements for signup
  const passwordRequirements = [
    { text: "At least 8 characters", met: signupPassword.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(signupPassword) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(signupPassword) },
    { text: "Contains number", met: /\d/.test(signupPassword) },
  ];

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

  return (
    <div className="space-y-4">
      <GoogleAuthButton mode="signup" disabled={loading} />
      <AuthDivider />
      
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
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Create Account & Start Free Trial
        </Button>
        <p className="text-xs text-gray-500 text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </div>
  );
};
