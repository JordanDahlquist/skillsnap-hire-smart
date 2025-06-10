
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const email = searchParams.get('email') || 'your email';
  const name = searchParams.get('name') || '';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!canResend || isResending) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: "Check your inbox for a new confirmation email.",
      });

      setCountdown(60);
      setCanResend(false);
    } catch (error: any) {
      toast({
        title: "Failed to resend email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <img 
                src="/lovable-uploads/fcccb8be-0469-47e0-abd3-15729af8467e.png" 
                alt="Atract"
                className="w-10 h-10"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a confirmation link to your inbox
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            {/* Email Icon and Status */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <Mail className="w-10 h-10 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Clock className="w-3 h-3 text-yellow-800" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Confirmation Email Sent
              </h2>
              <p className="text-gray-600">
                We've sent a confirmation email to <strong>{email}</strong>
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Next Steps:
              </h3>
              <ol className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                  Check your email inbox (and spam folder)
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                  Click the "Confirm Email Address" button in the email
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                  You'll be redirected back to start using Atract
                </li>
              </ol>
            </div>

            {/* Resend Email Section */}
            <div className="text-center border-t pt-6">
              <p className="text-gray-600 mb-4">
                Didn't receive the email?
              </p>
              
              {canResend ? (
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isResending ? "Sending..." : "Resend Confirmation Email"}
                </Button>
              ) : (
                <div className="text-center">
                  <Button disabled className="bg-gray-300">
                    Resend available in {countdown}s
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Please wait before requesting a new email
                  </p>
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Having trouble?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure {email} is correct</li>
                <li>• Add noreply@atract.ai to your contacts</li>
                <li>• Try a different browser if the link doesn't work</li>
              </ul>
            </div>

            {/* Back to Sign In */}
            <div className="text-center mt-8 pt-6 border-t">
              <Button variant="outline" asChild>
                <Link to="/auth">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmEmail;
