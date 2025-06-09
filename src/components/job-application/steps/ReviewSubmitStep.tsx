
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  User, 
  FileText, 
  Brain, 
  Video, 
  Send,
  Loader2 
} from "lucide-react";
import { Job } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApplicationFormData {
  name: string;
  email: string;
  portfolio: string;
  resumeUrl: string | null;
  answer1: string;
  answer2: string;
  answer3: string;
  skillsTestResponses: Array<{
    question: string;
    answer: string;
  }>;
  videoUrl: string | null;
}

interface ReviewSubmitStepProps {
  job: Job;
  jobId: string;
  formData: ApplicationFormData;
  onValidationChange: (isValid: boolean) => void;
}

export const ReviewSubmitStep = ({ 
  job, 
  jobId, 
  formData, 
  onValidationChange 
}: ReviewSubmitStepProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const triggerAiAnalysis = async (applicationId: string, applicationData: any, jobData: any) => {
    try {
      console.log('Triggering AI analysis for application:', applicationId);
      
      const { data, error } = await supabase.functions.invoke('analyze-application', {
        body: {
          applicationData,
          jobData
        }
      });

      if (error) {
        console.error('Error in AI analysis:', error);
        return;
      }

      if (data?.rating && data?.summary) {
        const { error: updateError } = await supabase
          .from('applications')
          .update({
            ai_rating: data.rating,
            ai_summary: data.summary,
            updated_at: new Date().toISOString()
          })
          .eq('id', applicationId);

        if (updateError) {
          console.error('Error updating application with AI analysis:', updateError);
        } else {
          console.log('AI analysis completed successfully for application:', applicationId);
        }
      }
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Insert the application
      const { data: applicationData, error: insertError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          name: formData.name,
          email: formData.email,
          portfolio: formData.portfolio,
          resume_file_path: formData.resumeUrl,
          answer_1: formData.answer1,
          answer_2: formData.answer2,
          answer_3: formData.answer3,
          skills_test_responses: formData.skillsTestResponses,
          interview_video_url: formData.videoUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Application submitted successfully!");
      setSubmitted(true);
      onValidationChange(true);

      // Fetch job data for AI analysis
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('title, description, role_type, experience_level, required_skills')
        .eq('id', jobId)
        .single();

      // Trigger AI analysis in the background
      if (applicationData && jobData && !jobError) {
        const analysisData = {
          name: formData.name,
          email: formData.email,
          portfolio: formData.portfolio,
          experience: '', 
          answer_1: formData.answer1,
          answer_2: formData.answer2,
          answer_3: formData.answer3,
          skills_test_responses: formData.skillsTestResponses
        };

        triggerAiAnalysis(applicationData.id, analysisData, jobData);
      }
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
        <div className="bg-green-50 rounded-lg p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">Application Submitted!</h2>
          <p className="text-green-800 mb-4">
            Thank you for applying to <strong>{job.title}</strong>
          </p>
          <p className="text-green-700 text-sm">
            We'll review your application and get back to you soon. You should receive a confirmation email shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Review Your Application</h2>
        <p className="text-gray-600 mt-2">
          Please review all information before submitting your application
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="font-medium">Name:</span> {formData.name}
          </div>
          <div>
            <span className="font-medium">Email:</span> {formData.email}
          </div>
          {formData.portfolio && (
            <div>
              <span className="font-medium">Portfolio:</span>{' '}
              <a href={formData.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {formData.portfolio}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-medium">Resume:</span>
            {formData.resumeUrl ? (
              <Badge variant="outline" className="text-green-600">
                <FileText className="w-3 h-3 mr-1" />
                Uploaded
              </Badge>
            ) : (
              <Badge variant="destructive">Not uploaded</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Application Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-medium">Why are you a good fit for this role?</span>
            <p className="text-gray-700 mt-1 text-sm bg-gray-50 p-3 rounded">
              {formData.answer1}
            </p>
          </div>
          <Separator />
          <div>
            <span className="font-medium">What is your experience in this field?</span>
            <p className="text-gray-700 mt-1 text-sm bg-gray-50 p-3 rounded">
              {formData.answer2}
            </p>
          </div>
          <Separator />
          <div>
            <span className="font-medium">What are your salary expectations?</span>
            <p className="text-gray-700 mt-1 text-sm bg-gray-50 p-3 rounded">
              {formData.answer3}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Skills Assessment */}
      {formData.skillsTestResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Skills Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                {formData.skillsTestResponses.length} questions answered
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Interview */}
      {formData.videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video Interview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Video responses recorded
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="text-center pt-6">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          size="lg"
          className="px-8"
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
        
        <p className="text-sm text-gray-500 mt-3">
          By submitting this application, you confirm that all information provided is accurate and complete.
        </p>
      </div>
    </div>
  );
};
