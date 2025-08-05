
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Footer } from "@/components/Footer";

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading } = useAuth();
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const email = searchParams.get('email') || 'your email';
  const name = searchParams.get('name') || '';
  
  // Check if user arrived via email confirmation link (has auth tokens in URL)
  const hasAuthTokens = searchParams.has('access_token') || searchParams.has('refresh_token') || 
                       searchParams.has('token_hash') || searchParams.has('type');
  const isFromEmailLink = hasAuthTokens;

  // Check if user is authenticated and redirect to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && isFromEmailLink) {
      // User has successfully confirmed email and is now authenticated
      toast({
        title: "Email confirmed!",
        description: "Welcome to Atract. Redirecting to your dashboard...",
      });
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate('/jobs', { replace: true });
      }, 1500);
    }
  }, [isAuthenticated, loading, navigate, toast, isFromEmailLink]);

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
      console.log('Attempting to resend confirmation email to:', email);
      
      // Generate confirmation URL (same as what would be used in signup)
      const confirmationUrl = `${window.location.origin}/confirm-email?email=${encodeURIComponent(email)}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
      
      console.log('Generated confirmation URL:', confirmationUrl);
      
      // Call our custom edge function instead of Supabase's built-in resend
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: email,
          name: name || email.split('@')[0], // Use email prefix if no name provided
          confirmationUrl: confirmationUrl
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to send confirmation email');
      }

      console.log('Edge function response:', data);

      toast({
        title: "Email sent!",
        description: "Check your inbox for a new confirmation email.",
      });

      setCountdown(60);
      setCanResend(false);
    } catch (error: any) {
      console.error('Error resending confirmation email:', error);
      toast({
        title: "Failed to resend email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking confirmation status...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and came from email link, show success message while redirecting
  if (isAuthenticated && isFromEmailLink) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Confirmed!</h1>
          <p className="text-gray-600 mb-4">Welcome to Atract! Redirecting to your dashboard...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
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

          <Card className="shadow-xl border border-gray-200 bg-white">
            <CardContent className="p-8 bg-white">
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
                  We've sent a confirmation email to <strong className="text-gray-900">{email}</strong>
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Next Steps:
                </h3>
                <ol className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                    <span className="text-gray-700">Check your email inbox (and spam folder)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                    <span className="text-gray-700">Click the "Confirm Email Address" button in the email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                    <span className="text-gray-700">You'll be automatically redirected to your dashboard</span>
                  </li>
                </ol>
              </div>

              {/* Resend Email Section */}
              <div className="text-center border-t border-gray-200 pt-6">
                <p className="text-gray-600 mb-4">
                  Didn't receive the email?
                </p>
                
                {canResend ? (
                  <Button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isResending ? "Sending..." : "Resend Confirmation Email"}
                  </Button>
                ) : (
                  <div className="text-center">
                    <Button disabled className="bg-gray-300 text-gray-500">
                      Resend available in {countdown}s
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Please wait before requesting a new email
                    </p>
                  </div>
                )}
              </div>

              {/* Help Text */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">Having trouble?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure <span className="font-medium">{email}</span> is correct</li>
                  <li>• Add noreply@atract.ai to your contacts</li>
                  <li>• Try a different browser if the link doesn't work</li>
                </ul>
              </div>

              {/* Back to Sign In */}
              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <Button variant="outline" asChild className="border-gray-300 text-gray-700 hover:bg-gray-50">
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
      <Footer />
    </div>
  );
};

export default ConfirmEmail;
