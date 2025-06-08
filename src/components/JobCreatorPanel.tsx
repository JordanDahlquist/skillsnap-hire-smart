
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, ArrowRight, Sparkles, Save, Eye } from "lucide-react";

interface JobFormData {
  title: string;
  description: string;
  employmentType: string;
  experienceLevel: string;
  skills: string;
  budget: string;
  duration: string;
  location: string;
}

interface JobCreatorPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JobCreatorPanel = ({ open, onOpenChange }: JobCreatorPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    employmentType: "full-time",
    experienceLevel: "mid-level",
    skills: "",
    budget: "",
    duration: "",
    location: "remote"
  });

  // Generated content
  const [generatedJobPost, setGeneratedJobPost] = useState("");
  const [generatedSkillsTest, setGeneratedSkillsTest] = useState("");

  const updateFormData = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateJobPost = async () => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the job title and description first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'job-post',
          jobData: {
            title: formData.title,
            employmentType: formData.employmentType,
            experience: formData.experienceLevel,
            duration: formData.duration,
            budget: formData.budget,
            skills: formData.skills,
            description: formData.description
          }
        }
      });

      if (error) throw error;
      
      setGeneratedJobPost(data.jobPost);
      toast({
        title: "Job Post Generated!",
        description: "Your AI-powered job posting is ready for review."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate job post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSkillsTest = async () => {
    if (!generatedJobPost) {
      toast({
        title: "Generate Job Post First",
        description: "Please generate the job post before creating the skills test.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'skills-test',
          existingJobPost: generatedJobPost
        }
      });

      if (error) throw error;
      
      setGeneratedSkillsTest(data.test);
      toast({
        title: "Skills Test Generated!",
        description: "Your AI-powered skills assessment is ready for review."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate skills test. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveJob = async (status: 'draft' | 'published') => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          role_type: formData.employmentType,
          employment_type: formData.employmentType,
          experience_level: formData.experienceLevel,
          required_skills: formData.skills,
          budget: formData.budget,
          duration: formData.duration,
          location_type: formData.location,
          generated_job_post: generatedJobPost,
          generated_test: generatedSkillsTest,
          status: status
        });

      if (error) throw error;

      toast({
        title: status === 'published' ? "Job Published!" : "Job Saved!",
        description: status === 'published' 
          ? "Your job posting is now live and accepting applications."
          : "Your job has been saved as a draft."
      });

      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        employmentType: "full-time",
        experienceLevel: "mid-level",
        skills: "",
        budget: "",
        duration: "",
        location: "remote"
      });
      setGeneratedJobPost("");
      setGeneratedSkillsTest("");
      setCurrentStep(1);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceedToStep2 = formData.title && formData.description;
  const canProceedToStep3 = generatedJobPost;
  const canPublish = generatedJobPost && generatedSkillsTest;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Create New Job</h2>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    placeholder="e.g. Senior React Developer"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select value={formData.employmentType} onValueChange={(value) => updateFormData('employmentType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select value={formData.experienceLevel} onValueChange={(value) => updateFormData('experienceLevel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry-level">Entry Level</SelectItem>
                        <SelectItem value="mid-level">Mid Level</SelectItem>
                        <SelectItem value="senior-level">Senior Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="skills">Required Skills</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => updateFormData('skills', e.target.value)}
                    placeholder="React, TypeScript, Node.js..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => updateFormData('budget', e.target.value)}
                      placeholder="$50-100/hr or $5000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => updateFormData('duration', e.target.value)}
                      placeholder="3 months, Ongoing..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Generate Job Post */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  AI Job Post Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!generatedJobPost ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Generate a professional job posting based on your details
                    </p>
                    <Button 
                      onClick={generateJobPost}
                      disabled={isGenerating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Job Post'}
                      <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="jobPost">Generated Job Post</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={generateJobPost}
                        disabled={isGenerating}
                      >
                        Regenerate
                      </Button>
                    </div>
                    <Textarea
                      id="jobPost"
                      value={generatedJobPost}
                      onChange={(e) => setGeneratedJobPost(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Generate Skills Test */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Skills Assessment Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!generatedSkillsTest ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Generate skills assessment questions based on your job post
                    </p>
                    <Button 
                      onClick={generateSkillsTest}
                      disabled={isGenerating || !generatedJobPost}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Skills Test'}
                      <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="skillsTest">Generated Skills Test</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={generateSkillsTest}
                        disabled={isGenerating}
                      >
                        Regenerate
                      </Button>
                    </div>
                    <Textarea
                      id="skillsTest"
                      value={generatedSkillsTest}
                      onChange={(e) => setGeneratedSkillsTest(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review & Publish */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  Review & Publish
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Job Title</h3>
                  <p className="text-gray-700">{formData.title}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Employment Type</h3>
                  <p className="text-gray-700">{formData.employmentType}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Experience Level</h3>
                  <p className="text-gray-700">{formData.experienceLevel}</p>
                </div>

                {generatedJobPost && (
                  <div>
                    <h3 className="font-semibold mb-2">Job Post Preview</h3>
                    <div className="bg-gray-50 p-4 rounded border max-h-32 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {generatedJobPost.substring(0, 200)}...
                      </p>
                    </div>
                  </div>
                )}

                {generatedSkillsTest && (
                  <div>
                    <h3 className="font-semibold mb-2">Skills Test Preview</h3>
                    <div className="bg-gray-50 p-4 rounded border max-h-32 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {generatedSkillsTest.substring(0, 200)}...
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep === 4 ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => saveJob('draft')}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button 
                    onClick={() => saveJob('published')}
                    disabled={isSaving || !canPublish}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Publish Job
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !canProceedToStep2) ||
                    (currentStep === 2 && !canProceedToStep3) ||
                    currentStep === 4
                  }
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
