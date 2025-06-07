
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const LinkedInCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('=== LinkedIn Callback Component Mounted ===');
    console.log('Current URL:', window.location.href);
    console.log('URL search params:', window.location.search);

    const handleCallback = async () => {
      try {
        console.log('=== Starting LinkedIn callback handling ===');

        // Check for OAuth errors first
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (errorParam) {
          console.error('OAuth error detected:', errorParam, errorDescription);
          throw new Error(`OAuth error: ${errorParam} - ${errorDescription}`);
        }

        // Retrieve job context from sessionStorage
        const storedContext = sessionStorage.getItem('linkedin_job_context');
        const storedRedirectUrl = sessionStorage.getItem('auth_redirect_url');
        console.log('Retrieved stored context:', storedContext);
        console.log('Retrieved stored redirect URL:', storedRedirectUrl);

        let jobId = null;
        let redirectUrl = '/jobs/public'; // Default fallback

        if (storedContext) {
          try {
            const jobContext = JSON.parse(storedContext);
            jobId = jobContext.jobId;
            console.log('Parsed job ID from context:', jobId);
            sessionStorage.removeItem('linkedin_job_context');
          } catch (error) {
            console.error('Error parsing stored job context:', error);
          }
        }

        if (storedRedirectUrl) {
          redirectUrl = storedRedirectUrl;
          sessionStorage.removeItem('auth_redirect_url');
          console.log('Using stored redirect URL:', redirectUrl);
        } else if (jobId) {
          redirectUrl = `/apply/${jobId}`;
          console.log('Using job-based redirect URL:', redirectUrl);
        }

        // Wait for OAuth session to be established
        console.log('Waiting for OAuth session...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (session?.user) {
          console.log('User authenticated successfully:', session.user.id);
          
          // Create transformed LinkedIn data from user metadata
          const userMetadata = session.user.user_metadata;
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

          // Store the data with timestamp
          const dataWithTimestamp = {
            ...transformedData,
            _timestamp: Date.now(),
            _source: 'linkedin_oauth'
          };
          
          sessionStorage.setItem('linkedin_profile_data', JSON.stringify(dataWithTimestamp));
          sessionStorage.setItem('linkedin_connected', 'true');
          
          console.log('Stored LinkedIn data, redirecting to:', redirectUrl);
          
          // Add success parameter and timestamp to prevent caching
          const finalRedirectUrl = `${redirectUrl}${redirectUrl.includes('?') ? '&' : '?'}linkedin=connected&t=${Date.now()}`;
          
          toast({
            title: "LinkedIn connected!",
            description: "Your profile information has been imported successfully.",
          });
          
          // Use replace to avoid back button issues
          window.location.replace(finalRedirectUrl);
        } else {
          console.error('No user session found after LinkedIn authentication');
          throw new Error('Authentication failed - no user session');
        }
      } catch (error) {
        console.error('=== LinkedIn callback error ===', error);
        
        toast({
          title: "LinkedIn connection failed",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive"
        });
        
        // Clean up stored data
        sessionStorage.removeItem('linkedin_job_context');
        sessionStorage.removeItem('auth_redirect_url');
        
        // Determine error redirect
        const storedContext = sessionStorage.getItem('linkedin_job_context');
        let errorRedirectUrl = '/jobs/public';
        
        if (storedContext) {
          try {
            const jobContext = JSON.parse(storedContext);
            if (jobContext.jobId) {
              errorRedirectUrl = `/apply/${jobContext.jobId}`;
            }
          } catch (e) {
            console.error('Error parsing context for error redirect:', e);
          }
        }

        console.log('Redirecting to error page:', errorRedirectUrl);
        window.location.replace(errorRedirectUrl);
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
