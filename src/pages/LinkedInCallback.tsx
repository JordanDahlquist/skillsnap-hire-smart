
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
        
        console.log('Error parameter from URL:', errorParam);
        console.log('Error description from URL:', errorDescription);

        if (errorParam) {
          console.error('OAuth error detected:', errorParam, errorDescription);
          throw new Error(`OAuth error: ${errorParam} - ${errorDescription}`);
        }

        // Retrieve job context from sessionStorage
        console.log('Retrieving job context from sessionStorage...');
        const storedContext = sessionStorage.getItem('linkedin_job_context');
        console.log('Stored context raw:', storedContext);

        let jobId = null;
        let originRoute = null;
        let originDomain = null;

        if (storedContext) {
          try {
            const jobContext = JSON.parse(storedContext);
            jobId = jobContext.jobId;
            originRoute = jobContext.originRoute;
            originDomain = jobContext.originDomain;
            console.log('Successfully parsed job context:', jobContext);
            console.log('Extracted job ID:', jobId);
            console.log('Extracted origin route:', originRoute);
            
            // Clean up the stored context
            sessionStorage.removeItem('linkedin_job_context');
            console.log('Cleaned up stored job context');
          } catch (error) {
            console.error('Error parsing stored job context:', error);
          }
        } else {
          console.warn('No job context found in sessionStorage');
        }

        // Wait for the OAuth flow to complete and session to be established
        console.log('Waiting for OAuth session to establish...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the session after OAuth redirect
        console.log('Attempting to get session...');
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
          
          // Determine the correct redirect URL based on retrieved job context
          let redirectUrl;
          
          if (jobId) {
            // Always redirect to the application page with the job ID
            redirectUrl = `/apply/${jobId}?linkedin=connected&t=${Date.now()}`;
            console.log('Job ID found from context, redirecting to application page:', redirectUrl);
          } else {
            console.log('No job ID found in context, checking for fallback options');
            
            // If we have origin route but no job ID, try to extract job ID from origin route
            if (originRoute && originRoute.includes('/apply/')) {
              const routeJobId = originRoute.split('/apply/')[1]?.split('?')[0];
              if (routeJobId) {
                redirectUrl = `/apply/${routeJobId}?linkedin=connected&t=${Date.now()}`;
                console.log('Extracted job ID from origin route:', routeJobId, 'redirecting to:', redirectUrl);
              } else {
                redirectUrl = '/jobs/public';
                console.log('Could not extract job ID from origin route, redirecting to public jobs');
              }
            } else {
              redirectUrl = '/jobs/public';
              console.log('No origin route or job context, redirecting to public jobs');
            }
          }
          
          console.log('Final redirect URL determined:', redirectUrl);
          console.log('About to redirect using window.location.replace...');
          
          // Use replace to avoid back button issues
          window.location.replace(redirectUrl);
        } else {
          console.error('No user session found after LinkedIn authentication');
          throw new Error('No user session found after LinkedIn authentication');
        }
      } catch (error) {
        console.error('=== LinkedIn callback error ===', error);
        
        toast({
          title: "LinkedIn connection failed",
          description: error instanceof Error ? error.message : "Please try again or use an alternative application method.",
          variant: "destructive"
        });
        
        // Try to extract job ID from stored context for error redirect
        let jobId = null;
        const storedContext = sessionStorage.getItem('linkedin_job_context');
        
        if (storedContext) {
          try {
            const jobContext = JSON.parse(storedContext);
            jobId = jobContext.jobId;
            console.log('Extracted job ID for error redirect:', jobId);
            
            // Clean up the stored context
            sessionStorage.removeItem('linkedin_job_context');
          } catch (error) {
            console.error('Error parsing stored job context for error redirect:', error);
          }
        }

        let errorRedirectUrl;
        if (jobId) {
          errorRedirectUrl = `/apply/${jobId}`;
          console.log('Redirecting to job application page after error:', errorRedirectUrl);
        } else {
          errorRedirectUrl = '/jobs/public';
          console.log('Redirecting to public jobs after error (no job ID)');
        }

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
