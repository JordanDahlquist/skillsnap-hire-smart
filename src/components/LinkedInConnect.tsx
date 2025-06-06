
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Loader2, User, Briefcase, MapPin, Mail, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LinkedInProfile {
  name: string;
  email: string;
  headline: string;
  location: string;
  pictureUrl?: string;
  positions: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  skills: string[];
  summary?: string;
}

interface LinkedInConnectProps {
  jobId?: string;
  onLinkedInData: (data: any) => void;
  onRemove: () => void;
  connectedProfile: LinkedInProfile | null;
}

export const LinkedInConnect = ({ jobId, onLinkedInData, onRemove, connectedProfile }: LinkedInConnectProps) => {
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  const handleLinkedInConnect = async () => {
    setConnecting(true);
    try {
      // Store the job ID before starting OAuth flow
      if (jobId) {
        localStorage.setItem('linkedin_job_id', jobId);
      }

      console.log('Starting LinkedIn OAuth flow...');
      console.log('Current origin:', window.location.origin);
      console.log('Job ID being stored:', jobId);

      // Create a more explicit redirect URL
      const redirectUrl = `${window.location.origin}/linkedin-callback`;
      console.log('Redirect URL:', redirectUrl);

      // Use Supabase Auth's LinkedIn OIDC provider with basic scopes
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          scopes: 'openid profile email',
          redirectTo: redirectUrl,
        }
      });

      if (error) {
        console.error('LinkedIn OAuth error:', error);
        throw error;
      }

      console.log('LinkedIn OAuth initiated successfully:', data);
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      toast({
        title: "Connection failed",
        description: "Unable to connect to LinkedIn. Please try again.",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  };

  const fetchLinkedInProfile = async (accessToken: string) => {
    try {
      // Call our edge function to fetch LinkedIn profile data
      const { data, error } = await supabase.functions.invoke('fetch-linkedin-profile', {
        body: { accessToken }
      });

      if (error) throw error;

      const profileData = data.profile;
      
      // Transform LinkedIn data to match our application format
      const transformedData = {
        personalInfo: {
          name: profileData.name || "",
          email: profileData.email || "",
          phone: "",
          location: profileData.location || "",
        },
        workExperience: profileData.positions?.map((pos: any) => ({
          company: pos.company || "",
          position: pos.title || "",
          startDate: pos.startDate || "",
          endDate: pos.endDate || "Present",
          description: pos.description || "",
        })) || [],
        education: [], // LinkedIn basic profile doesn't include education in free tier
        skills: profileData.skills || [],
        summary: profileData.headline || profileData.summary || "",
        totalExperience: calculateTotalExperience(profileData.positions || []),
      };

      onLinkedInData(transformedData);
      
      toast({
        title: "LinkedIn connected!",
        description: "Your profile information has been imported successfully.",
      });
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      toast({
        title: "Profile import failed",
        description: "Unable to import your LinkedIn profile. Please try uploading a resume instead.",
        variant: "destructive"
      });
    }
  };

  const calculateTotalExperience = (positions: any[]) => {
    if (!positions.length) return "0 years";
    
    let totalMonths = 0;
    positions.forEach(pos => {
      const startDate = new Date(pos.startDate || '1970-01-01');
      const endDate = pos.endDate && pos.endDate !== 'Present' ? new Date(pos.endDate) : new Date();
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    });
    
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    
    if (years === 0) return `${months} months`;
    if (months === 0) return `${years} years`;
    return `${years} years ${months} months`;
  };

  if (connectedProfile) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Linkedin className="w-5 h-5" />
              LinkedIn Profile Connected
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{connectedProfile.name}</h3>
              <p className="text-sm text-gray-600">{connectedProfile.headline}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{connectedProfile.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{connectedProfile.location}</span>
            </div>
          </div>

          {connectedProfile.positions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recent Experience</h4>
              <div className="space-y-2">
                {connectedProfile.positions.slice(0, 2).map((pos, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{pos.title} at {pos.company}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {connectedProfile.skills.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {connectedProfile.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {connectedProfile.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{connectedProfile.skills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Linkedin className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect with LinkedIn</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Import your basic profile information from LinkedIn to quickly fill out your application.
        </p>
        <Button 
          onClick={handleLinkedInConnect}
          disabled={connecting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {connecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Connecting...
            </>
          ) : (
            <>
              <Linkedin className="w-4 h-4 mr-2" />
              Connect LinkedIn
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 mt-3">
          We'll only access your basic profile information.{" "}
          <a href="/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            View our Privacy Policy
          </a>
        </p>
      </CardContent>
    </Card>
  );
};
