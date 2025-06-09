
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApplicationFormProps {
  jobId: string;
}

export const ApplicationForm = ({ jobId }: ApplicationFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [answer3, setAnswer3] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!resumeUrl) {
      toast.error("Please upload your resume");
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
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
        });

      if (error) throw error;

      toast.success("Application submitted successfully!");
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for this Job</CardTitle>
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
          <Button disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
