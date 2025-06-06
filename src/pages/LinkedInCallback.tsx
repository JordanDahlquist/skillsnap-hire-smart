
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

        if (session?.user) {
          // Extract basic profile information from the user metadata
          const userMetadata = session.user.user_metadata;
          console.log('LinkedIn user metadata:', userMetadata);
          
          // Transform the basic available data
          const transformedData = {
            personalInfo: {
              name: userMetadata.full_name || userMetadata.name || "",
              email: session.user.email || "",
              phone: "",
              location: "", // Not available in basic scope
            },
            workExperience: [], // Not available in basic scope
            education: [], // Not available in basic scope
            skills: [], // Not available in basic scope
            summary: userMetadata.headline || "", // May not be available
            totalExperience: "0 years",
          };

          // Store the transformed data temporarily
          sessionStorage.setItem('linkedin_profile_data', JSON.stringify(transformedData));
          
          toast({
            title: "LinkedIn connected!",
            description: "Basic profile information imported successfully.",
          });

          // Get the original job ID from localStorage
          const jobId = localStorage.getItem('linkedin_job_id');
          if (jobId) {
            localStorage.removeItem('linkedin_job_id');
            navigate(`/apply/${jobId}?linkedin=connected`);
          } else {
            navigate('/jobs/public');
          }
        } else {
          throw new Error('No user session found after LinkedIn authentication');
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
