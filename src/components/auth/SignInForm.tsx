
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { AuthDivider } from "./AuthDivider";

interface SignInFormProps {
  onForgotPassword: () => void;
}

export const SignInForm = ({ onForgotPassword }: SignInFormProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  return (
    <div className="space-y-4 bg-white">
      <GoogleAuthButton mode="signin" disabled={loading} />
      <AuthDivider />
      
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <Label htmlFor="signin-email" className="text-gray-700">Email</Label>
          <Input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
          />
        </div>
        <div>
          <Label htmlFor="signin-password" className="text-gray-700">Password</Label>
          <div className="relative">
            <Input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
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
          className="w-full bg-[#007af6] hover:bg-[#0056b3] text-white" 
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Sign In
        </Button>
        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={onForgotPassword}
            className="text-sm text-[#007af6] hover:text-[#0056b3]"
          >
            Forgot your password?
          </Button>
        </div>
      </form>
    </div>
  );
};
