
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const LinkedInCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('LinkedInCallback component mounted');
    console.log('Current URL:', window.location.href);
    console.log('URL search params:', window.location.search);

    const handleCallback = async () => {
      try {
        console.log('Starting LinkedIn callback handling...');

        // Get the session after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Session data:', session);
        console.log('Session error:', error);
        
        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        if (session?.user) {
          console.log('User found in session:', session.user.id);
          
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

          console.log('Transformed LinkedIn data:', transformedData);

          // Store the transformed data temporarily
          sessionStorage.setItem('linkedin_profile_data', JSON.stringify(transformedData));
          console.log('Stored LinkedIn profile data in sessionStorage');
          
          toast({
            title: "LinkedIn connected!",
            description: "Basic profile information imported successfully.",
          });

          // Get the original job ID from localStorage
          const jobId = localStorage.getItem('linkedin_job_id');
          console.log('Retrieved job ID from localStorage:', jobId);
          
          if (jobId) {
            localStorage.removeItem('linkedin_job_id');
            console.log('Navigating to application page with job ID:', jobId);
            navigate(`/apply/${jobId}?linkedin=connected`);
          } else {
            console.log('No job ID found, navigating to public jobs');
            navigate('/jobs/public');
          }
        } else {
          console.error('No user session found after LinkedIn authentication');
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

    // Add a small delay to ensure the OAuth flow completes
    const timeoutId = setTimeout(() => {
      handleCallback();
    }, 100);

    return () => clearTimeout(timeoutId);
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
