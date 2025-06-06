
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

        // Extract state parameter from URL to get job ID
        const urlParams = new URLSearchParams(window.location.search);
        const stateParam = urlParams.get('state');
        console.log('State parameter from URL:', stateParam);

        let jobId = null;
        let originRoute = null;

        if (stateParam) {
          try {
            const stateData = JSON.parse(atob(stateParam));
            jobId = stateData.jobId;
            originRoute = stateData.originRoute;
            console.log('Decoded state data:', stateData);
          } catch (error) {
            console.error('Error decoding state parameter:', error);
          }
        }

        // Wait for the OAuth flow to complete and session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the session after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session data after LinkedIn OAuth:', session);
        console.log('Session error:', sessionError);
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (session?.user) {
          console.log('User found in session:', session.user.id);
          console.log('User metadata:', session.user.user_metadata);
          
          // Extract profile information from the user metadata
          const userMetadata = session.user.user_metadata;
          
          // Transform the basic available data
          const transformedData = {
            personalInfo: {
              name: userMetadata.full_name || userMetadata.name || session.user.email?.split('@')[0] || "",
              email: session.user.email || "",
              phone: "",
              location: userMetadata.location || "",
            },
            workExperience: [],
            education: [],
            skills: [],
            summary: userMetadata.headline || userMetadata.summary || "",
            totalExperience: "0 years",
          };

          console.log('Transformed LinkedIn data:', transformedData);

          // Store the transformed data with a timestamp for debugging
          const dataWithTimestamp = {
            ...transformedData,
            _timestamp: Date.now(),
            _source: 'linkedin_oauth'
          };
          
          sessionStorage.setItem('linkedin_profile_data', JSON.stringify(dataWithTimestamp));
          console.log('Stored LinkedIn profile data in sessionStorage with timestamp:', dataWithTimestamp._timestamp);
          
          // Also store a flag to indicate successful LinkedIn connection
          sessionStorage.setItem('linkedin_connected', 'true');
          
          // Add another small delay to ensure sessionStorage write completes
          await new Promise(resolve => setTimeout(resolve, 200));
          
          if (jobId) {
            // Always redirect to the application page regardless of origin
            // This ensures users can complete their job application with LinkedIn data
            const redirectUrl = `/apply/${jobId}?linkedin=connected&t=${Date.now()}`;
            console.log('Redirecting to application page:', redirectUrl);
            
            // Use replace to avoid back button issues
            window.location.replace(redirectUrl);
          } else {
            console.log('No job ID found, navigating to public jobs');
            window.location.replace('/jobs/public');
          }
        } else {
          console.error('No user session found after LinkedIn authentication');
          
          // Check if there's an error in the URL
          const urlParams = new URLSearchParams(window.location.search);
          const error = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');
          
          if (error) {
            console.error('OAuth error from URL:', error, errorDescription);
            throw new Error(`OAuth error: ${error} - ${errorDescription}`);
          }
          
          throw new Error('No user session found after LinkedIn authentication');
        }
      } catch (error) {
        console.error('LinkedIn callback error:', error);
        
        toast({
          title: "LinkedIn connection failed",
          description: error instanceof Error ? error.message : "Please try again or use an alternative application method.",
          variant: "destructive"
        });
        
        // Try to extract job ID from URL state parameter for error redirect
        const urlParams = new URLSearchParams(window.location.search);
        const stateParam = urlParams.get('state');
        let jobId = null;

        if (stateParam) {
          try {
            const stateData = JSON.parse(atob(stateParam));
            jobId = stateData.jobId;
          } catch (error) {
            console.error('Error decoding state parameter for error redirect:', error);
          }
        }

        if (jobId) {
          window.location.replace(`/apply/${jobId}`);
        } else {
          window.location.replace('/jobs/public');
        }
      }
    };

    // Start the callback handling
    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting LinkedIn...</h2>
        <p className="text-gray-600 mb-4">Please wait while we import your profile information.</p>
        <div className="text-sm text-gray-500">
          <p>Processing your LinkedIn profile data...</p>
          <p className="mt-2">You'll be redirected to complete your application shortly.</p>
        </div>
      </div>
    </div>
  );
};
