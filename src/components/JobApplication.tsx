
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Calendar, FileText, Send, Loader2, MapPin, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Job {
  id: string;
  title: string;
  description: string;
  role_type: string;
  experience_level: string;
  employment_type: string;
  location_type?: string | null;
  country?: string | null;
  state?: string | null;
  region?: string | null;
  city?: string | null;
  duration: string;
  budget: string;
  required_skills: string;
  generated_job_post: string;
  generated_test: string;
  created_at: string;
}

export const JobApplication = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: "",
    portfolio: "",
    experience: "",
    answer1: "",
    answer2: "",
    answer3: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .eq('status', 'active')
          .single();

        if (error) throw error;
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: "Job not found",
          description: "This job posting may no longer be available.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, toast]);

  const getLocationDisplay = () => {
    if (!job) return '';
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setSubmitting(true);
    try {
      // Submit application
      const { data: application, error: submitError } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          name: applicationData.name,
          email: applicationData.email,
          portfolio: applicationData.portfolio,
          experience: applicationData.experience,
          answer_1: applicationData.answer1,
          answer_2: applicationData.answer2,
          answer_3: applicationData.answer3
        })
        .select()
        .single();

      if (submitError) throw submitError;

      // Analyze application with AI
      try {
        const { data: analysis } = await supabase.functions.invoke('analyze-application', {
          body: {
            applicationData: {
              name: applicationData.name,
              experience: applicationData.experience,
              portfolio: applicationData.portfolio,
              answer_1: applicationData.answer1,
              answer_2: applicationData.answer2,
              answer_3: applicationData.answer3
            },
            jobData: job
          }
        });

        if (analysis) {
          // Update application with AI analysis
          await supabase
            .from('applications')
            .update({
              ai_summary: analysis.summary,
              ai_rating: analysis.rating
            })
            .eq('id', application.id);
        }
      } catch (analysisError) {
        console.error('Error analyzing application:', analysisError);
        // Continue even if analysis fails
      }

      setSubmitted(true);
      toast({
        title: "Application submitted!",
        description: "Thank you for your application. We'll review it and get back to you soon.",
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error submitting application",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="p-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
              <p className="text-gray-600">This job posting is no longer available.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for taking the time to complete our skills assessment. 
                We'll review your application and get back to you within 2-3 business days.
              </p>
              <Button onClick={() => window.close()} variant="outline">
                Close Window
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const skills = job.required_skills.split(',').map(skill => skill.trim());
  const daysSincePosted = Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Job Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {job.role_type}
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {job.experience_level}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {job.employment_type}
                  </Badge>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{getLocationDisplay()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{job.duration}</span>
                  </div>
                  {job.budget && (
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.budget}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {daysSincePosted} {daysSincePosted === 1 ? 'day' : 'days'} ago</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Role</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={applicationData.name}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={applicationData.email}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="portfolio">Portfolio/GitHub URL</Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={applicationData.portfolio}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, portfolio: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="experience">Brief overview of your experience</Label>
                <Textarea
                  id="experience"
                  placeholder="Tell us about your background and relevant experience..."
                  value={applicationData.experience}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, experience: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Skills Assessment
                <Badge variant="secondary" className="ml-auto">Estimated: 2 hours</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.generated_test}
                </div>
              </div>
              
              <div>
                <Label className="text-base font-semibold">Your Responses</Label>
                <div className="space-y-4 mt-3">
                  <div>
                    <Label htmlFor="answer1">Response 1</Label>
                    <Textarea
                      id="answer1"
                      placeholder="Your response to the first question..."
                      value={applicationData.answer1}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, answer1: e.target.value }))}
                      rows={6}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="answer2">Response 2</Label>
                    <Textarea
                      id="answer2"
                      placeholder="Your response to the second question..."
                      value={applicationData.answer2}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, answer2: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="answer3">Response 3</Label>
                    <Textarea
                      id="answer3"
                      placeholder="Your response to the third question..."
                      value={applicationData.answer3}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, answer3: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              type="submit" 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
