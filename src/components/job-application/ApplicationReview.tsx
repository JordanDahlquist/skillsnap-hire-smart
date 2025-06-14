
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, User, FileText, Brain, Video, Send, Loader2 } from "lucide-react";
import { Job } from "@/types";
import { PersonalInfo } from "@/types/jobForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApplicationReviewProps {
  job: Job;
  personalInfo: PersonalInfo;
  skillsResponses: Array<{ question: string; answer: string }>;
  videoUrl: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

export const ApplicationReview = ({ 
  job, 
  personalInfo, 
  skillsResponses, 
  videoUrl, 
  onBack, 
  onSubmit 
}: ApplicationReviewProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    // Add validation to prevent placeholder data submission
    if (!personalInfo.fullName || personalInfo.fullName.trim() === '' || personalInfo.fullName === 'John Doe') {
      toast.error("Please enter your actual name in the personal information section");
      return;
    }

    if (!personalInfo.email || personalInfo.email.trim() === '' || personalInfo.email === 'john@example.com') {
      toast.error("Please enter your actual email address in the personal information section");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting application with data:', {
        name: personalInfo.fullName,
        email: personalInfo.email,
        personalInfo
      });

      // Parse video interview responses from the JSON string if needed
      let interviewVideoResponses = [];
      if (videoUrl) {
        try {
          const parsedVideoResponses = JSON.parse(videoUrl);
          interviewVideoResponses = Array.isArray(parsedVideoResponses) ? parsedVideoResponses : [];
        } catch (parseError) {
          console.warn('Could not parse video responses:', parseError);
          // If it's not JSON, treat as a simple URL
          interviewVideoResponses = [];
        }
      }

      // Insert the application using the actual form data from personalInfo
      const { data: applicationData, error: insertError } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          name: personalInfo.fullName, // Use actual form data
          email: personalInfo.email, // Use actual form data
          phone: personalInfo.phone,
          location: personalInfo.location,
          portfolio_url: personalInfo.portfolioUrl,
          linkedin_url: personalInfo.linkedinUrl,
          github_url: personalInfo.githubUrl,
          cover_letter: personalInfo.coverLetter,
          resume_file_path: personalInfo.resumeUrl,
          skills_test_responses: skillsResponses,
          interview_video_responses: interviewVideoResponses,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Application submitted successfully:', applicationData);
      toast.success("Application submitted successfully!");
      setSubmitted(true);
      onSubmit();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-6">
        <Card className="bg-green-50 border border-green-200">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Application Submitted!</h2>
            <p className="text-green-800 mb-4">
              Thank you for applying to <strong>{job.title}</strong>
            </p>
            <p className="text-green-700 text-sm">
              We'll review your application and get back to you soon. You should receive a confirmation email shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Review Your Application
          </CardTitle>
          <p className="text-gray-700">
            Please review all information before submitting your application
          </p>
        </CardHeader>
      </Card>

      {/* Personal Information */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-gray-900"><span className="font-medium">Name:</span> {personalInfo.fullName}</div>
          <div className="text-gray-900"><span className="font-medium">Email:</span> {personalInfo.email}</div>
          {personalInfo.phone && <div className="text-gray-900"><span className="font-medium">Phone:</span> {personalInfo.phone}</div>}
          {personalInfo.location && <div className="text-gray-900"><span className="font-medium">Location:</span> {personalInfo.location}</div>}
          
          {(personalInfo.portfolioUrl || personalInfo.linkedinUrl || personalInfo.githubUrl) && (
            <>
              <Separator />
              <div className="space-y-2">
                {personalInfo.portfolioUrl && (
                  <div className="text-gray-900">
                    <span className="font-medium">Portfolio:</span>{' '}
                    <a href={personalInfo.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {personalInfo.portfolioUrl}
                    </a>
                  </div>
                )}
                {personalInfo.linkedinUrl && (
                  <div className="text-gray-900">
                    <span className="font-medium">LinkedIn:</span>{' '}
                    <a href={personalInfo.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {personalInfo.linkedinUrl}
                    </a>
                  </div>
                )}
                {personalInfo.githubUrl && (
                  <div className="text-gray-900">
                    <span className="font-medium">GitHub:</span>{' '}
                    <a href={personalInfo.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {personalInfo.githubUrl}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
          
          <Separator />
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">Resume:</span>
            {personalInfo.resumeUrl ? (
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                <FileText className="w-3 h-3 mr-1" />
                {personalInfo.resumeFile?.name || 'Uploaded'}
              </Badge>
            ) : (
              <Badge variant="destructive">Not uploaded</Badge>
            )}
          </div>
          
          {personalInfo.coverLetter && (
            <>
              <Separator />
              <div>
                <span className="font-medium text-gray-900">Cover Letter:</span>
                <p className="text-gray-800 mt-1 text-sm bg-gray-50 p-3 rounded border border-gray-200">
                  {personalInfo.coverLetter}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Skills Assessment */}
      {skillsResponses.length > 0 && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <Brain className="w-5 h-5" />
              Skills Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <CheckCircle className="w-3 h-3 mr-1" />
              {skillsResponses.length} questions answered
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Video Interview */}
      {videoUrl && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <Video className="w-5 h-5" />
              Video Interview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <CheckCircle className="w-3 h-3 mr-1" />
              Video responses recorded
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Submit Section */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              size="lg"
              className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
            
            <p className="text-sm text-gray-600">
              By submitting this application, you confirm that all information provided is accurate and complete.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back
        </Button>
      </div>
    </div>
  );
};
