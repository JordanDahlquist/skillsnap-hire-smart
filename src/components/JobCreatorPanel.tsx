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
import { ArrowLeft, ArrowRight, Sparkles, Save, Eye, FileText, Edit3 } from "lucide-react";
import { PdfUpload } from "@/components/PdfUpload";
import { RichTextEditor } from "@/components/RichTextEditor";
import { parseMarkdown } from "@/utils/markdownParser";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // PDF upload state
  const [uploadedPdfContent, setUploadedPdfContent] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [useOriginalPdf, setUseOriginalPdf] = useState<boolean | null>(null);

  // Generated content
  const [generatedJobPost, setGeneratedJobPost] = useState("");
  const [generatedSkillsTest, setGeneratedSkillsTest] = useState("");

  // Edit modes for rich text editing
  const [isEditingJobPost, setIsEditingJobPost] = useState(false);
  const [isEditingSkillsTest, setIsEditingSkillsTest] = useState(false);

  const updateFormData = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePdfUpload = (content: string, fileName: string) => {
    setUploadedPdfContent(content);
    setPdfFileName(fileName);
    setFormData(prev => ({ ...prev, description: content }));
    setUseOriginalPdf(null); // Reset choice when new PDF is uploaded
  };

  const handlePdfRemove = () => {
    setUploadedPdfContent(null);
    setPdfFileName(null);
    setUseOriginalPdf(null);
    setFormData(prev => ({ ...prev, description: "" }));
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

    // If user chose to use original PDF content, skip generation
    if (uploadedPdfContent && useOriginalPdf === true) {
      setGeneratedJobPost(formData.description);
      toast({
        title: "Using Original Content",
        description: "Using your uploaded job description as-is."
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Enhanced data payload with all form fields and debugging
      const jobDataPayload = {
        title: formData.title,
        employmentType: formData.employmentType, // Fixed: using employmentType consistently
        experienceLevel: formData.experienceLevel,
        duration: formData.duration,
        budget: formData.budget,
        skills: formData.skills,
        location: formData.location, // Added: location was missing
        description: formData.description
      };

      console.log('Sending job data to AI:', jobDataPayload);

      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'job-post',
          jobData: jobDataPayload
        }
      });

      if (error) throw error;
      
      setGeneratedJobPost(data.jobPost);
      toast({
        title: "Job Post Generated!",
        description: uploadedPdfContent && useOriginalPdf === false 
          ? "Your PDF content has been rewritten by AI." 
          : "Your AI-powered job posting is ready for review."
      });
    } catch (error) {
      console.error('Error generating job post:', error);
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

  const handleJobPostSave = () => {
    setIsEditingJobPost(false);
    toast({
      title: "Job Post Updated",
      description: "Your changes have been saved."
    });
  };

  const handleJobPostCancel = () => {
    setIsEditingJobPost(false);
  };

  const handleSkillsTestSave = () => {
    setIsEditingSkillsTest(false);
    toast({
      title: "Skills Test Updated", 
      description: "Your changes have been saved."
    });
  };

  const handleSkillsTestCancel = () => {
    setIsEditingSkillsTest(false);
  };

  const saveJob = async (status: 'draft' | 'active') => {
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
        title: status === 'active' ? "Job Published!" : "Job Saved!",
        description: status === 'active' 
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
      setUploadedPdfContent(null);
      setPdfFileName(null);
      setUseOriginalPdf(null);
      setCurrentStep(1);
      setIsEditingJobPost(false);
      setIsEditingSkillsTest(false);
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
  const canActivate = generatedJobPost && generatedSkillsTest;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Create New Job</h2>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center py-2 px-4 border-b flex-shrink-0">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-8 h-1 mx-1 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content Area - Flexible */}
        <div className="flex-1 overflow-hidden p-3">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 h-full overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="title" className="text-sm">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => updateFormData('title', e.target.value)}
                      placeholder="e.g. Senior React Developer"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="employmentType" className="text-sm">Employment Type</Label>
                    <Select value={formData.employmentType} onValueChange={(value) => updateFormData('employmentType', value)}>
                      <SelectTrigger className="mt-1">
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
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm">Job Description *</Label>
                  <p className="text-xs text-gray-500 mb-1">Basic info for AI to generate professional job description</p>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={8}
                    className="mt-1"
                    required
                  />
                </div>

                {/* PDF Upload Section - More Compact */}
                <div className="space-y-1">
                  <PdfUpload
                    onFileUpload={handlePdfUpload}
                    onRemove={handlePdfRemove}
                    uploadedFile={pdfFileName}
                  />
                  
                  {/* PDF Choice Section */}
                  {uploadedPdfContent && useOriginalPdf === null && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">PDF Content Loaded</span>
                      </div>
                      <p className="text-xs text-blue-700 mb-2">How would you like to use this content?</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUseOriginalPdf(true)}
                          className="text-xs h-6 px-2"
                        >
                          Keep Original
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUseOriginalPdf(false)}
                          className="text-xs h-6 px-2"
                        >
                          Have AI Rewrite
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Show choice made */}
                  {uploadedPdfContent && useOriginalPdf !== null && (
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-800">
                          {useOriginalPdf ? "Using original PDF content" : "AI will rewrite PDF content"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUseOriginalPdf(null)}
                          className="text-xs h-5 px-1 text-green-600 hover:text-green-800"
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="experienceLevel" className="text-sm">Experience Level</Label>
                    <Select value={formData.experienceLevel} onValueChange={(value) => updateFormData('experienceLevel', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry-level">Entry Level</SelectItem>
                        <SelectItem value="mid-level">Mid Level</SelectItem>
                        <SelectItem value="senior-level">Senior Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget" className="text-sm">Budget</Label>
                    <Input
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => updateFormData('budget', e.target.value)}
                      placeholder="$50-100/hr"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration" className="text-sm">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => updateFormData('duration', e.target.value)}
                      placeholder="3 months"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="skills" className="text-sm">Required Skills</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => updateFormData('skills', e.target.value)}
                    placeholder="React, TypeScript, Node.js..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Generate Job Post - REDESIGNED */}
          {currentStep === 2 && (
            <div className="h-full flex flex-col overflow-hidden">
              {!generatedJobPost ? (
                <Card className="h-full">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      {uploadedPdfContent && useOriginalPdf === true ? "Original Job Post" : "AI Job Post Generator"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ready to Generate Your Job Post
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        {uploadedPdfContent && useOriginalPdf === true
                          ? "Use your uploaded job description as the final job post"
                          : uploadedPdfContent && useOriginalPdf === false
                          ? "Generate an improved version of your uploaded job description"
                          : "Create a professional job posting based on your details"
                        }
                      </p>
                      <Button 
                        onClick={generateJobPost}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="default"
                      >
                        {isGenerating ? 'Processing...' : 
                         uploadedPdfContent && useOriginalPdf === true ? 'Use Original Content' :
                         uploadedPdfContent && useOriginalPdf === false ? 'Rewrite with AI' :
                         'Generate Job Post'}
                        <Sparkles className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex flex-col overflow-hidden">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        {uploadedPdfContent && useOriginalPdf === true ? "Original Job Post" : "Generated Job Post"}
                      </CardTitle>
                      {!isEditingJobPost && !(uploadedPdfContent && useOriginalPdf === true) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={generateJobPost}
                          disabled={isGenerating}
                          className="text-xs h-8 px-3"
                        >
                          {isGenerating ? 'Regenerating...' : 'Regenerate'}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    {isEditingJobPost ? (
                      <RichTextEditor
                        value={generatedJobPost}
                        onChange={setGeneratedJobPost}
                        onSave={handleJobPostSave}
                        onCancel={handleJobPostCancel}
                        placeholder="Enter your job posting content here..."
                      />
                    ) : (
                      <div className="h-full flex flex-col">
                        <div className="flex-shrink-0 p-4 border-b bg-gray-50">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              Click to edit or use the buttons on the right
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setIsEditingJobPost(true)}
                              className="flex items-center gap-1 text-xs h-8 px-3"
                            >
                              <Edit3 className="w-3 h-3" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <ScrollArea className="h-full w-full">
                            <div 
                              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors min-h-full"
                              onClick={() => setIsEditingJobPost(true)}
                              style={{
                                lineHeight: '1.6',
                                fontSize: '14px',
                                wordWrap: 'break-word'
                              }}
                              dangerouslySetInnerHTML={{ 
                                __html: parseMarkdown(generatedJobPost) 
                              }}
                            />
                          </ScrollArea>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Generate Skills Test - REDESIGNED */}
          {currentStep === 3 && (
            <div className="h-full flex flex-col overflow-hidden">
              {!generatedSkillsTest ? (
                <Card className="h-full">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      Skills Assessment Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Create Skills Assessment
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Generate targeted assessment questions based on your job post to evaluate candidate skills effectively
                      </p>
                      <Button 
                        onClick={generateSkillsTest}
                        disabled={isGenerating || !generatedJobPost}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="default"
                      >
                        {isGenerating ? 'Generating...' : 'Generate Skills Test'}
                        <Sparkles className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex flex-col overflow-hidden">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        Generated Skills Test
                      </CardTitle>
                      {!isEditingSkillsTest && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={generateSkillsTest}
                          disabled={isGenerating}
                          className="text-xs h-8 px-3"
                        >
                          {isGenerating ? 'Regenerating...' : 'Regenerate'}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    {isEditingSkillsTest ? (
                      <RichTextEditor
                        value={generatedSkillsTest}
                        onChange={setGeneratedSkillsTest}
                        onSave={handleSkillsTestSave}
                        onCancel={handleSkillsTestCancel}
                        placeholder="Enter your skills test questions here..."
                      />
                    ) : (
                      <div className="h-full flex flex-col">
                        <div className="flex-shrink-0 p-4 border-b bg-gray-50">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              Click to edit or use the buttons on the right
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setIsEditingSkillsTest(true)}
                              className="flex items-center gap-1 text-xs h-8 px-3"
                            >
                              <Edit3 className="w-3 h-3" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <ScrollArea className="h-full w-full">
                            <div 
                              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors min-h-full"
                              onClick={() => setIsEditingSkillsTest(true)}
                              style={{
                                lineHeight: '1.6',
                                fontSize: '14px',
                                wordWrap: 'break-word'
                              }}
                              dangerouslySetInnerHTML={{ 
                                __html: parseMarkdown(generatedSkillsTest) 
                              }}
                            />
                          </ScrollArea>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 4: Review & Publish - REDESIGNED */}
          {currentStep === 4 && (
            <div className="h-full flex flex-col overflow-hidden">
              <div className="flex-shrink-0 mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  Review & Publish
                </h2>
                <p className="text-sm text-gray-600">Review your job details and generated content before publishing</p>
              </div>

              {/* Job Details Summary - Compact */}
              <div className="flex-shrink-0 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="font-medium text-gray-700">Title:</span>
                      <p className="text-gray-900 truncate">{formData.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <p className="text-gray-900">{formData.employmentType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Level:</span>
                      <p className="text-gray-900">{formData.experienceLevel}</p>
                    </div>
                    {pdfFileName && (
                      <div>
                        <span className="font-medium text-gray-700">Source:</span>
                        <p className="text-xs text-gray-600 truncate">
                          {pdfFileName} {useOriginalPdf === true ? "(original)" : "(AI rewritten)"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Previews - Main Area */}
              <div className="flex-1 space-y-4 overflow-hidden">
                {/* Job Post Preview */}
                {generatedJobPost && (
                  <Card className="flex-1 flex flex-col overflow-hidden">
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          Job Post Preview
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEditingJobPost(true)}
                          className="text-xs h-8 px-3"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                      <ScrollArea className="h-full w-full">
                        <div 
                          className="p-4 prose max-w-none text-sm leading-relaxed"
                          style={{
                            lineHeight: '1.7',
                            fontSize: '14px',
                            wordWrap: 'break-word'
                          }}
                          dangerouslySetInnerHTML={{ 
                            __html: parseMarkdown(generatedJobPost) 
                          }}
                        />
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Skills Test Preview */}
                {generatedSkillsTest && (
                  <Card className="flex-1 flex flex-col overflow-hidden">
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          Skills Test Preview
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEditingSkillsTest(true)}
                          className="text-xs h-8 px-3"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                      <ScrollArea className="h-full w-full">
                        <div 
                          className="p-4 prose max-w-none text-sm leading-relaxed"
                          style={{
                            lineHeight: '1.7',
                            fontSize: '14px',
                            wordWrap: 'break-word'
                          }}
                          dangerouslySetInnerHTML={{ 
                            __html: parseMarkdown(generatedSkillsTest) 
                          }}
                        />
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* No Content Message */}
                {!generatedJobPost && !generatedSkillsTest && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Generated Yet</h3>
                      <p className="text-sm">Please go back to previous steps to generate your job post and skills test.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center p-3 border-t bg-gray-50 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
            size="sm"
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
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  onClick={() => saveJob('active')}
                  disabled={isSaving || !canActivate}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
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
                size="sm"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
