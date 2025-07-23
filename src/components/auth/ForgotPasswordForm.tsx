
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  onBack: () => void;
}

export const ForgotPasswordForm = ({ email, setEmail, onBack }: ForgotPasswordFormProps) => {
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { toast } = useToast();

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

  if (resetEmailSent) {
    return (
      <div className="text-center space-y-6 bg-white">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-white rotate-180" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Password reset email sent! Check your inbox and follow the instructions to reset your password.
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleForgotPassword} className="space-y-6 bg-white">
      <div className="text-center space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Reset your password</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      <div className="space-y-3">
        <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">Email</Label>
        <Input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          className="h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-lg focus:border-[#007af6] focus:ring-[#007af6]"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 bg-[#007af6] hover:bg-[#0056b3] text-white font-medium rounded-lg" 
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Send Reset Email
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onBack}
        className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Sign In
      </Button>
    </form>
  );
};
