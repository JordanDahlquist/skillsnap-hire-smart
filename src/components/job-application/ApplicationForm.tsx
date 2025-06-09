import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, XCircle, FileX, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ApplicationFormProps {
  jobId: string;
  isApplicationOpen: boolean;
  jobStatus: string;
}

export const ApplicationForm = ({ jobId, isApplicationOpen, jobStatus }: ApplicationFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [answer3, setAnswer3] = useState("");

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
        // Update the application with AI analysis results
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
      // Don't show error to user - AI analysis is optional
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!resumeUrl) {
      toast.error("Please upload your resume");
      setSubmitting(false);
      return;
    }

    try {
      // First, insert the application
      const { data: applicationData, error: insertError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          name,
          email,
          portfolio,
          resume_file_path: resumeUrl,
          answer_1: answer1,
          answer_2: answer2,
          answer_3: answer3,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Application submitted successfully!");

      // Fetch job data for AI analysis
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('title, description, role_type, experience_level, required_skills')
        .eq('id', jobId)
        .single();

      // Trigger AI analysis in the background (don't wait for it)
      if (applicationData && jobData && !jobError) {
        const analysisData = {
          name,
          email,
          portfolio,
          experience: '', // No experience field in current form
          answer_1: answer1,
          answer_2: answer2,
          answer_3: answer3
        };

        // Don't await this - let it run in background
        triggerAiAnalysis(applicationData.id, analysisData, jobData);
      }

      // Reset form
      setName("");
      setEmail("");
      setPortfolio("");
      setResumeUrl(null);
      setAnswer1("");
      setAnswer2("");
      setAnswer3("");
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusMessage = () => {
    switch (jobStatus) {
      case 'draft':
        return {
          icon: <FileX className="w-5 h-5 text-gray-500" />,
          title: "Position Not Yet Published",
          description: "This position is still in draft mode and is not yet accepting applications. Please check back later when it becomes available.",
          variant: "default" as const
        };
      case 'paused':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-600" />,
          title: "Applications Temporarily Paused",
          description: "Applications for this position are currently paused. The employer may resume accepting applications soon. Please check back later.",
          variant: "default" as const
        };
      case 'closed':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          title: "Applications Closed",
          description: "This position is no longer accepting new applications. The application period has ended or the position has been filled.",
          variant: "destructive" as const
        };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  if (!isApplicationOpen) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {statusMessage?.icon}
            {statusMessage?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={statusMessage?.variant}>
            <AlertDescription>
              {statusMessage?.description}
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" asChild className="flex-1">
              <Link to="/jobs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Other Positions
              </Link>
            </Button>
            
            {jobStatus === 'paused' && (
              <Button variant="outline" className="flex-1" disabled>
                <Clock className="w-4 h-4 mr-2" />
                Get Notified When Open
              </Button>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Job Status: 
              <Badge className="ml-2" variant={jobStatus === 'closed' ? 'destructive' : 'secondary'}>
                {jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
              </Badge>
            </p>
            <p className="text-xs text-gray-500">
              Even though applications are not currently being accepted, you can still view the full job details above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Apply for this Job
          <Badge className="bg-green-100 text-green-800">
            Open for Applications
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="portfolio">Portfolio URL (Optional)</Label>
            <Input
              type="url"
              id="portfolio"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
            />
          </div>
          <div>
            <Label>Resume Upload</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Simulate file upload - in production, upload to Supabase Storage
                    setResumeUrl(`uploaded/${file.name}`);
                    toast.success("Resume uploaded successfully");
                  }
                }}
                className="hidden"
                id="resume-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('resume-upload')?.click()}
              >
                Choose Resume File
              </Button>
              {resumeUrl && (
                <p className="mt-2 text-sm text-green-600">
                  Resume uploaded: {resumeUrl.split('/').pop()}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="answer1">
              Why are you a good fit for this role?
            </Label>
            <Textarea
              id="answer1"
              value={answer1}
              onChange={(e) => setAnswer1(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="answer2">
              What is your experience in this field?
            </Label>
            <Textarea
              id="answer2"
              value={answer2}
              onChange={(e) => setAnswer2(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="answer3">
              What are your salary expectations?
            </Label>
            <Textarea
              id="answer3"
              value={answer3}
              onChange={(e) => setAnswer3(e.target.value)}
              rows={4}
            />
          </div>
          <Button disabled={submitting} className="w-full">
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
