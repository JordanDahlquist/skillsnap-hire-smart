
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const LinkedInCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session?.provider_token) {
          // Store the LinkedIn access token temporarily
          sessionStorage.setItem('linkedin_access_token', session.provider_token);
          
          toast({
            title: "LinkedIn connected!",
            description: "Redirecting back to application...",
          });

          // Get the original job ID from localStorage or URL params
          const jobId = localStorage.getItem('linkedin_job_id');
          if (jobId) {
            localStorage.removeItem('linkedin_job_id');
            navigate(`/apply/${jobId}?linkedin=connected`);
          } else {
            navigate('/jobs/public');
          }
        } else {
          throw new Error('No access token received from LinkedIn');
        }
      } catch (error) {
        console.error('LinkedIn callback error:', error);
        toast({
          title: "LinkedIn connection failed",
          description: "Please try again or use an alternative application method.",
          variant: "destructive"
        });
        navigate('/jobs/public');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting LinkedIn...</h2>
        <p className="text-gray-600">Please wait while we import your profile information.</p>
      </div>
    </div>
  );
};
