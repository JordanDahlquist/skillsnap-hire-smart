import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Calendar, FileText, Send, Loader2, MapPin, Briefcase, User, Mail, Phone, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parseMarkdown } from "@/utils/markdownParser";
import { ResumeUpload } from "./ResumeUpload";
import { LinkedInConnect } from "./LinkedInConnect";
import { ErrorBoundary } from "./ErrorBoundary";

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

interface ParsedResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
  summary: string;
  totalExperience: string;
  linkedInProfile?: {
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
  };
}

export const JobApplication = () => {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobError, setJobError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [linkedInProfile, setLinkedInProfile] = useState<any>(null);
  const [applicationMethod, setApplicationMethod] = useState<'resume' | 'linkedin' | 'manual'>('manual');
  const [linkedInDataLoading, setLinkedInDataLoading] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    available_start_date: "",
    portfolio_url: "",
    linkedin_url: "",
    github_url: "",
    cover_letter: "",
    answer1: "",
    answer2: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Add comprehensive debugging at component mount
  useEffect(() => {
    console.log('=== JobApplication Component Mounted ===');
    console.log('Job ID from params:', jobId);
    console.log('Current URL:', window.location.href);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    console.log('Component state:', {
      jobLoading,
      jobError,
      linkedInDataLoading,
      applicationMethod,
      submitted
    });
  }, []);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        console.error('No job ID provided');
        setJobError('No job ID provided');
        setJobLoading(false);
        return;
      }
      
      try {
        console.log('Fetching job with ID:', jobId);
        // Remove the status filter to allow fetching jobs with any status
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        console.log('Job fetch result:', { data, error });

        if (error) {
          console.error('Job fetch error:', error);
          setJobError(`Job fetch failed: ${error.message}`);
          throw error;
        }
        
        if (!data) {
          console.error('No job data returned');
          setJobError('Job not found');
          return;
        }
        
        console.log('Job fetched successfully:', data.title);
        setJob(data);
        setJobError(null);
      } catch (error) {
        console.error('Error fetching job:', error);
        setJobError(error instanceof Error ? error.message : 'Failed to fetch job');
        toast({
          title: "Job fetch error",
          description: "There was an issue loading the job details. You can still submit your application.",
          variant: "destructive"
        });
      } finally {
        console.log('Setting jobLoading to false');
        setJobLoading(false);
      }
    };

    fetchJob();
  }, [jobId, toast]);

  // Enhanced LinkedIn connection check with more robust error handling
  useEffect(() => {
    const linkedInConnected = searchParams.get('linkedin');
    console.log('=== LinkedIn Effect Running ===');
    console.log('LinkedIn connected param:', linkedInConnected);
    console.log('Current URL:', window.location.href);
    console.log('Job loading state:', jobLoading);
    
    if (linkedInConnected === 'connected') {
      console.log('LinkedIn connection detected, starting data retrieval...');
      setLinkedInDataLoading(true);
      
      // Check immediately first
      const storedProfileData = sessionStorage.getItem('linkedin_profile_data');
      const linkedInConnectedFlag = sessionStorage.getItem('linkedin_connected');
      
      console.log('Stored profile data exists:', !!storedProfileData);
      console.log('LinkedIn connected flag:', linkedInConnectedFlag);
      
      if (storedProfileData) {
        try {
          const profileData = JSON.parse(storedProfileData);
          console.log('Successfully parsed LinkedIn profile data:', profileData);
          
          handleLinkedInData(profileData);
          
          // Clean up session storage
          sessionStorage.removeItem('linkedin_profile_data');
          sessionStorage.removeItem('linkedin_connected');
          
          setLinkedInDataLoading(false);
          
          toast({
            title: "LinkedIn connected!",
            description: "Your profile information has been imported successfully.",
          });
          
          return;
        } catch (error) {
          console.error('Error parsing LinkedIn profile data:', error);
          setLinkedInDataLoading(false);
          toast({
            title: "Profile import failed",
            description: "Unable to parse your LinkedIn profile data. You can still fill out the form manually.",
            variant: "destructive"
          });
          return;
        }
      } else {
        console.log('No LinkedIn data found in session storage');
        setLinkedInDataLoading(false);
        toast({
          title: "No profile data found",
          description: "No LinkedIn profile data was retrieved. You can try connecting again or fill out the form manually.",
          variant: "destructive"
        });
      }
    }
  }, [searchParams, toast]);

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

  const handleResumeData = (data: ParsedResumeData, filePath: string) => {
    console.log('Handling resume data:', data);
    setParsedData(data);
    setResumeFile(filePath);
    setApplicationMethod('resume');
    setLinkedInProfile(null); // Clear LinkedIn data if resume is uploaded
    
    // Auto-fill form with parsed data
    setApplicationData(prev => ({
      ...prev,
      name: data.personalInfo?.name || "",
      email: data.personalInfo?.email || "",
      phone: data.personalInfo?.phone || "",
      location: data.personalInfo?.location || "",
    }));
  };

  const handleLinkedInData = (data: ParsedResumeData) => {
    console.log('Handling LinkedIn data in JobApplication:', data);
    setParsedData(data);
    
    // Set LinkedIn profile if it exists in the data
    if (data.linkedInProfile) {
      setLinkedInProfile(data.linkedInProfile);
    } else {
      // Create a basic LinkedIn profile from the data
      setLinkedInProfile({
        name: data.personalInfo?.name || "",
        email: data.personalInfo?.email || "",
        headline: data.summary || "",
        location: data.personalInfo?.location || "",
        positions: data.workExperience || [],
        skills: data.skills || []
      });
    }
    
    setApplicationMethod('linkedin');
    setResumeFile(null); // Clear resume if LinkedIn is connected
    
    // Auto-fill form with LinkedIn data
    setApplicationData(prev => ({
      ...prev,
      name: data.personalInfo?.name || "",
      email: data.personalInfo?.email || "",
      phone: data.personalInfo?.phone || "",
      location: data.personalInfo?.location || "",
    }));

    console.log('LinkedIn data processed, application method set to:', 'linkedin');
    console.log('Form data updated:', {
      name: data.personalInfo?.name,
      email: data.personalInfo?.email,
      phone: data.personalInfo?.phone,
      location: data.personalInfo?.location
    });
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setParsedData(null);
    setApplicationMethod('manual');
    // Reset form to empty state
    setApplicationData({
      name: "",
      email: "",
      phone: "",
      location: "",
      available_start_date: "",
      portfolio_url: "",
      linkedin_url: "",
      github_url: "",
      cover_letter: "",
      answer1: "",
      answer2: "",
    });
  };

  const handleRemoveLinkedIn = () => {
    setLinkedInProfile(null);
    setParsedData(null);
    setApplicationMethod('manual');
    // Reset form to empty state
    setApplicationData({
      name: "",
      email: "",
      phone: "",
      location: "",
      available_start_date: "",
      portfolio_url: "",
      linkedin_url: "",
      github_url: "",
      cover_letter: "",
      answer1: "",
      answer2: "",
    });
  };

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
      // Submit application with comprehensive data
      const { data: application, error: submitError } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          name: applicationData.name,
          email: applicationData.email,
          phone: applicationData.phone,
          location: applicationData.location,
          available_start_date: applicationData.available_start_date || null,
          portfolio_url: applicationData.portfolio_url || null,
          linkedin_url: applicationData.linkedin_url || null,
          github_url: applicationData.github_url || null,
          cover_letter: applicationData.cover_letter || null,
          resume_file_path: resumeFile,
          parsed_resume_data: parsedData as any, // Cast to any to satisfy Json type
          work_experience: parsedData?.workExperience as any || null,
          education: parsedData?.education as any || null,
          skills: parsedData?.skills as any || null,
          answer_1: applicationData.answer1,
          answer_2: applicationData.answer2,
          experience: parsedData?.summary || "",
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
              experience: parsedData?.summary || "",
              portfolio: applicationData.portfolio_url,
              answer_1: applicationData.answer1,
              answer_2: applicationData.answer2,
              parsedData: parsedData
            },
            jobData: job
          }
        });

        if (analysis) {
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

  // Show loading state
  if (jobLoading && !linkedInDataLoading) {
    console.log('Rendering loading state - jobLoading:', jobLoading, 'linkedInDataLoading:', linkedInDataLoading);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
          <p className="text-xs text-gray-500 mt-2">Job ID: {jobId}</p>
        </div>
      </div>
    );
  }

  // Show success state
  if (submitted) {
    console.log('Rendering success state');
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
                Thank you for your application. We'll review your information and get back to you within 2-3 business days.
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

  console.log('Rendering main application form');
  console.log('Current state:', {
    job: !!job,
    jobError,
    linkedInDataLoading,
    applicationMethod,
    linkedInProfile: !!linkedInProfile
  });

  // Main application form - show even if there's a job error, but with a warning
  const skills = job?.required_skills?.split(',').map(skill => skill.trim()) || [];
  const daysSincePosted = job ? Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Show job error warning if exists but don't block the form */}
          {jobError && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-amber-800 mb-2">Job Details Unavailable</h2>
                <p className="text-amber-700 mb-2">{jobError}</p>
                <p className="text-gray-600 text-sm">
                  You can still submit your application below. Job ID: {jobId}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Job Header - only show if job data is available */}
          {job && (
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
                        {job.generated_job_post ? (
                          <div 
                            className="text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                              __html: parseMarkdown(job.generated_job_post) 
                            }}
                          />
                        ) : (
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
                        )}
                      </div>
                    </div>

                    {skills.length > 0 && (
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
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* LinkedIn Data Loading State */}
          {linkedInDataLoading && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <div>
                    <p className="text-blue-800 font-medium">Processing LinkedIn data...</p>
                    <p className="text-blue-600 text-sm">Please wait while we import your profile information.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Apply Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Quick Apply
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Choose how you'd like to apply - upload your resume, connect with LinkedIn, or fill out manually.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Application Method Tabs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Resume Upload Option */}
                  <div className={`p-1 rounded-lg ${applicationMethod === 'resume' ? 'bg-purple-50 border border-purple-200' : ''}`}>
                    <ResumeUpload 
                      onResumeData={handleResumeData}
                      onRemove={handleRemoveResume}
                      uploadedFile={resumeFile}
                    />
                  </div>

                  {/* LinkedIn Connect Option */}
                  <div className={`p-1 rounded-lg ${applicationMethod === 'linkedin' ? 'bg-blue-50 border border-blue-200' : ''}`}>
                    <LinkedInConnect
                      jobId={jobId}
                      onLinkedInData={handleLinkedInData}
                      onRemove={handleRemoveLinkedIn}
                      connectedProfile={linkedInProfile}
                    />
                  </div>
                </div>

                {/* Manual Entry Notice */}
                {applicationMethod === 'manual' && !linkedInDataLoading && (
                  <div className="text-center py-4 text-gray-600">
                    <p className="text-sm">
                      No file uploaded or LinkedIn connected. Please fill out the form manually below.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                  {applicationMethod !== 'manual' && (
                    <Badge variant="secondary" className="ml-2">
                      {applicationMethod === 'resume' ? 'From Resume' : 'From LinkedIn'}
                    </Badge>
                  )}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={applicationData.phone}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Current Location</Label>
                    <Input
                      id="location"
                      placeholder="City, State/Country"
                      value={applicationData.location}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Available Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={applicationData.available_start_date}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, available_start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="portfolio">Portfolio/Website URL</Label>
                    <Input
                      id="portfolio"
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={applicationData.portfolio_url}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={applicationData.linkedin_url}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub Profile</Label>
                    <Input
                      id="github"
                      type="url"
                      placeholder="https://github.com/yourusername"
                      value={applicationData.github_url}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, github_url: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cover_letter">Cover Letter (Optional)</Label>
                  <Textarea
                    id="cover_letter"
                    placeholder="Tell us why you're interested in this role..."
                    value={applicationData.cover_letter}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, cover_letter: e.target.value }))}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Assessment */}
            {job && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Quick Assessment
                    <Badge variant="secondary" className="ml-auto">2 Questions</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div 
                      className="text-gray-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: parseMarkdown(job.generated_test) 
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base font-semibold">Your Responses</Label>
                    <div className="space-y-4 mt-3">
                      <div>
                        <Label htmlFor="answer1">Response 1 *</Label>
                        <Textarea
                          id="answer1"
                          placeholder="Your response to the first question..."
                          value={applicationData.answer1}
                          onChange={(e) => setApplicationData(prev => ({ ...prev, answer1: e.target.value }))}
                          rows={4}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="answer2">Response 2 *</Label>
                        <Textarea
                          id="answer2"
                          placeholder="Your response to the second question..."
                          value={applicationData.answer2}
                          onChange={(e) => setApplicationData(prev => ({ ...prev, answer2: e.target.value }))}
                          rows={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button 
                type="submit" 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
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
    </ErrorBoundary>
  );
};
