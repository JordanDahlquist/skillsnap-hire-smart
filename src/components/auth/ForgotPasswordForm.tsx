
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
      <div className="text-center space-y-4">
        <div className="text-green-600 text-sm">
          Password reset email sent! Check your inbox and follow the instructions to reset your password.
        </div>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
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
        onClick={onBack}
        className="w-full"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Sign In
      </Button>
    </form>
  );
};
