import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResumeUpload } from "./ResumeUpload";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, Clock, Users, Eye } from "lucide-react";
import { toast } from "sonner";
import { useViewTracking } from "@/hooks/useViewTracking";

interface Job {
  id: string;
  title: string;
  description: string;
  ai_mini_description?: string | null;
  role_type: string;
  experience_level: string;
  location_type?: string | null;
  country?: string | null;
  state?: string | null;
  region?: string | null;
  city?: string | null;
  budget?: string | null;
  duration?: string | null;
  created_at: string;
  view_count?: number;
  applications?: { count: number }[];
}

export const JobApplication = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Track job view when component mounts
  useViewTracking(jobId || '', !!jobId && !!job);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [answer3, setAnswer3] = useState("");

  const fetchJob = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          applications(count)
        `)
        .eq('id', jobId)
        .single();
      
      if (error) throw error;
      
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [jobId]);

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
          resume_url: resumeUrl,
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

  const getLocationDisplay = () => {
    if (!job) return 'Not specified';
    const { location_type, country, state, region, city } = job;
    
    if (location_type === 'remote') {
      if (country) {
        return `Remote (${country})`;
      }
      return 'Remote';
    }
    
    if (country === 'United States' && state) {
      const parts = [city, state, region].filter(Boolean);
      return parts.join(', ');
    }
    
    if (country) {
      const parts = [city, country].filter(Boolean);
      return parts.join(', ');
    }
    
    return location_type ? location_type.charAt(0).toUpperCase() + location_type.slice(1) : 'Not specified';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  const applicationsCount = job?.applications?.[0]?.count || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600">The job you're looking for doesn't exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Job Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                  {job.title}
                </CardTitle>
                
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="text-sm">
                    {job.role_type}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {job.experience_level}
                  </Badge>
                </div>
                
                <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{getLocationDisplay()}</span>
                  </div>
                  {job.budget && (
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.budget}</span>
                    </div>
                  )}
                  {job.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{job.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{applicationsCount} application{applicationsCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{job.view_count || 0} view{(job.view_count || 0) !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {getTimeAgo(job.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {job.ai_mini_description && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Quick Overview</h3>
                <p className="text-blue-800">{job.ai_mini_description}</p>
              </div>
            )}
            
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-3">Job Description</h3>
              <div className="whitespace-pre-wrap text-gray-700">
                {job.description}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
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
                <ResumeUpload setResumeUrl={setResumeUrl} />
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-1"
                  >
                    View Uploaded Resume
                  </a>
                )}
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
      </div>
    </div>
  );
};
