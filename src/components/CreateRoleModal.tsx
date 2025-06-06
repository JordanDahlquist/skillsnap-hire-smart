import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, FileText, Users, MapPin, Info, Edit3, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LocationSelector } from "./LocationSelector";
import { PdfUpload } from "./PdfUpload";
import { AiGenerationLoader } from "./AiGenerationLoader";
import { RichTextEditor } from "./RichTextEditor";
import { useGenerateMiniDescription } from "@/hooks/useGenerateMiniDescription";

interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateRoleModal = ({ open, onOpenChange }: CreateRoleModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isGeneratingJobPost, setIsGeneratingJobPost] = useState(false);
  const [isGeneratingSkillsTest, setIsGeneratingSkillsTest] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    roleType: "developer", // Default value since dropdown is removed
    employmentType: "",
    experience: "",
    duration: "",
    budget: "",
    skills: "",
    locationType: "remote",
    country: "",
    state: "",
    city: "",
  });
  const [uploadedPdf, setUploadedPdf] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [useAiRewrite, setUseAiRewrite] = useState<boolean | null>(null);
  const [generatedJob, setGeneratedJob] = useState("");
  const [generatedTest, setGeneratedTest] = useState("");
  
  // Editing states
  const [isEditingJobPost, setIsEditingJobPost] = useState(false);
  const [isEditingSkillsTest, setIsEditingSkillsTest] = useState(false);
  const [editedJobPost, setEditedJobPost] = useState("");
  const [editedSkillsTest, setEditedSkillsTest] = useState("");
  const [hasEditedJobPost, setHasEditedJobPost] = useState(false);
  const [hasEditedSkillsTest, setHasEditedSkillsTest] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { generateMiniDescription } = useGenerateMiniDescription();

  // Helper function to format content for display
  const formatContentForDisplay = (content: string) => {
    if (!content) return '';
    
    // If content already has HTML tags, return as is
    if (content.includes('<') && content.includes('>')) {
      return content;
    }
    
    // Convert plain text to HTML with proper formatting
    return content
      .split('\n\n') // Split by double line breaks for paragraphs
      .map(paragraph => {
        if (!paragraph.trim()) return '';
        
        // Handle numbered lists
        if (paragraph.match(/^\d+\./m)) {
          const items = paragraph.split('\n').filter(line => line.trim());
          return '<ol>' + items.map(item => 
            `<li>${item.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</li>`
          ).join('') + '</ol>';
        }
        
        // Handle bullet points
        if (paragraph.match(/^[-•*]/m)) {
          const items = paragraph.split('\n').filter(line => line.trim());
          return '<ul>' + items.map(item => 
            `<li>${item.replace(/^[-•*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</li>`
          ).join('') + '</ul>';
        }
        
        // Handle regular paragraphs
        return '<p>' + paragraph
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
          .replace(/\n/g, '<br>') + '</p>';
      })
      .filter(Boolean)
      .join('');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePdfUpload = (content: string, fileName: string) => {
    setUploadedPdf(content);
    setPdfFileName(fileName);
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handlePdfRemove = () => {
    setUploadedPdf(null);
    setPdfFileName("");
    setUseAiRewrite(null);
    setFormData(prev => ({ ...prev, description: "" }));
  };

  const generateJobPost = async () => {
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        description: uploadedPdf && !useAiRewrite ? uploadedPdf : formData.description,
        isPdfUpload: !!uploadedPdf,
        useAiRewrite: useAiRewrite
      };

      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: { 
          jobData,
          type: 'job-post'
        }
      });

      if (error) throw error;

      setGeneratedJob(data.jobPost);
      setEditedJobPost(data.jobPost);
      setIsGeneratingJobPost(false);
    } catch (error) {
      console.error('Error generating job post:', error);
      toast({
        title: "Error generating job post",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
      setIsGeneratingJobPost(false);
    } finally {
      setLoading(false);
    }
  };

  const generateSkillsTest = async () => {
    setLoading(true);
    try {
      // Use the final job post content (edited version if available, otherwise generated)
      const finalJobPost = hasEditedJobPost ? editedJobPost : generatedJob;

      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: { 
          type: 'skills-test',
          existingJobPost: finalJobPost
        }
      });

      if (error) throw error;

      setGeneratedTest(data.test);
      setEditedSkillsTest(data.test);
      setIsGeneratingSkillsTest(false);
    } catch (error) {
      console.error('Error generating skills test:', error);
      toast({
        title: "Error generating skills test",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
      setIsGeneratingSkillsTest(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEditJobPost = () => {
    setIsEditingJobPost(true);
    setEditedJobPost(hasEditedJobPost ? editedJobPost : generatedJob);
  };

  const handleSaveJobPost = () => {
    setIsEditingJobPost(false);
    setHasEditedJobPost(true);
    toast({
      title: "Job post updated",
      description: "Your changes have been saved.",
    });
  };

  const handleCancelJobPostEdit = () => {
    setIsEditingJobPost(false);
    setEditedJobPost(hasEditedJobPost ? editedJobPost : generatedJob);
  };

  const handleEditSkillsTest = () => {
    setIsEditingSkillsTest(true);
    setEditedSkillsTest(hasEditedSkillsTest ? editedSkillsTest : generatedTest);
  };

  const handleSaveSkillsTest = () => {
    setIsEditingSkillsTest(false);
    setHasEditedSkillsTest(true);
    toast({
      title: "Skills test updated",
      description: "Your changes have been saved.",
    });
  };

  const handleCancelSkillsTestEdit = () => {
    setIsEditingSkillsTest(false);
    setEditedSkillsTest(hasEditedSkillsTest ? editedSkillsTest : generatedTest);
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setIsGeneratingJobPost(true);
      setStep(3);
      // Generate only the job post
      await generateJobPost();
    } else if (step === 3) {
      setIsGeneratingSkillsTest(true);
      setStep(4);
      // Generate the skills test using the final job post
      await generateSkillsTest();
    } else {
      // Create the role in database
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to create a job posting.",
            variant: "destructive"
          });
          return;
        }

        // Use edited content if available, otherwise use generated content
        const finalJobPost = hasEditedJobPost ? editedJobPost : generatedJob;
        const finalSkillsTest = hasEditedSkillsTest ? editedSkillsTest : generatedTest;

        const { data: job, error } = await supabase
          .from('jobs')
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            role_type: formData.roleType,
            employment_type: formData.employmentType,
            experience_level: formData.experience,
            duration: formData.duration || null,
            budget: formData.budget || null,
            required_skills: formData.skills,
            location_type: formData.locationType,
            country: formData.country || null,
            state: formData.state || null,
            city: formData.city || null,
            generated_job_post: finalJobPost,
            generated_test: finalSkillsTest,
            status: 'active'
          })
          .select()
          .single();

        if (error) throw error;

        // Automatically generate mini description for the new job
        try {
          await generateMiniDescription({
            id: job.id,
            title: job.title,
            description: job.description,
            role_type: job.role_type,
          });
        } catch (miniDescError) {
          console.error('Error generating mini description:', miniDescError);
          // Don't fail the job creation if mini description fails
        }

        toast({
          title: "Role created successfully!",
          description: "Your job posting is now live and ready to receive applications.",
        });

        navigate(`/dashboard/${job.id}`);
        
        // Reset form
        onOpenChange(false);
        setStep(1);
        setFormData({
          title: "",
          description: "",
          roleType: "developer",
          employmentType: "",
          experience: "",
          duration: "",
          budget: "",
          skills: "",
          locationType: "remote",
          country: "",
          state: "",
          city: "",
        });
        setUploadedPdf(null);
        setPdfFileName("");
        setUseAiRewrite(null);
        setGeneratedJob("");
        setGeneratedTest("");
        setEditedJobPost("");
        setEditedSkillsTest("");
        setHasEditedJobPost(false);
        setHasEditedSkillsTest(false);
        setIsEditingJobPost(false);
        setIsEditingSkillsTest(false);
      } catch (error) {
        console.error('Error creating job:', error);
        toast({
          title: "Error creating job",
          description: "Please try again or contact support if the problem persists.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const canProceed = step === 1 ? 
    formData.title && (formData.description || uploadedPdf) && formData.employmentType && formData.experience :
    true;

  const isProjectBased = formData.employmentType === 'project' || formData.employmentType === 'contract-to-hire';

  const getEmploymentTypes = () => [
    { value: 'project', label: 'Project-based' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract-to-hire', label: 'Contract-to-hire' }
  ];

  const getDurationOptions = () => {
    if (formData.employmentType === 'contract-to-hire') {
      return [
        { value: '3 months', label: '3 months' },
        { value: '6 months', label: '6 months' },
        { value: '12 months', label: '12 months' },
        { value: '18 months', label: '18 months' }
      ];
    }
    return [
      { value: '1-2 weeks', label: '1-2 weeks' },
      { value: '1 month', label: '1 month' },
      { value: '2-3 months', label: '2-3 months' },
      { value: '3-6 months', label: '3-6 months' },
      { value: 'ongoing', label: 'Ongoing' }
    ];
  };

  const getBudgetPlaceholder = () => {
    switch (formData.employmentType) {
      case 'full-time':
        return 'e.g., $80,000 annually';
      case 'part-time':
        return 'e.g., $50/hour';
      case 'contract-to-hire':
        return 'e.g., $5,000/month';
      default:
        return 'e.g., $2,500 total';
    }
  };

  const getBudgetLabel = () => {
    switch (formData.employmentType) {
      case 'full-time':
        return 'Salary Range (Optional)';
      case 'part-time':
        return 'Hourly Rate (Optional)';
      case 'contract-to-hire':
        return 'Contract Budget (Optional)';
      default:
        return 'Project Budget (Optional)';
    }
  };

  const getDurationLabel = () => {
    return formData.employmentType === 'contract-to-hire' ? 'Contract Duration' : 'Project Duration';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Create a New Role
          </DialogTitle>
        </DialogHeader>

        <Tabs value={step.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="1" disabled={step < 1}>
              <FileText className="w-4 h-4 mr-2" />
              Role Details
            </TabsTrigger>
            <TabsTrigger value="2" disabled={step < 2}>
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </TabsTrigger>
            <TabsTrigger value="3" disabled={step < 3}>
              <Sparkles className="w-4 h-4 mr-2" />
              Job Post
            </TabsTrigger>
            <TabsTrigger value="4" disabled={step < 4}>
              <Users className="w-4 h-4 mr-2" />
              Skills Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="1" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Role Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Senior React Developer"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select value={formData.employmentType} onValueChange={(value) => handleInputChange("employmentType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getEmploymentTypes().map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                {isProjectBased && (
                  <div>
                    <Label htmlFor="duration">{getDurationLabel()}</Label>
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${getDurationLabel().toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {getDurationOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.employmentType && (
                  <div>
                    <Label htmlFor="budget">{getBudgetLabel()}</Label>
                    <Input
                      id="budget"
                      placeholder={getBudgetPlaceholder()}
                      value={formData.budget}
                      onChange={(e) => handleInputChange("budget", e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty if you don't want to show compensation details
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="skills">Required Skills (comma separated)</Label>
                  <Input
                    id="skills"
                    placeholder="e.g. React, TypeScript, Node.js"
                    value={formData.skills}
                    onChange={(e) => handleInputChange("skills", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Job Description Made Easy</h4>
                    <p className="text-sm text-blue-800">
                      Describe the role below or upload an existing job description PDF. Our AI will create a comprehensive, professional job description for you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Role Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what the person will be working on, key responsibilities, and any specific requirements..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-center text-sm text-gray-500 font-medium">
                    OR
                  </div>
                  
                  <PdfUpload
                    onFileUpload={handlePdfUpload}
                    onRemove={handlePdfRemove}
                    uploadedFile={uploadedPdf}
                  />
                </div>

                {uploadedPdf && useAiRewrite === null && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-orange-900 mb-2">AI Enhancement Option</h4>
                      <p className="text-sm text-orange-800 mb-3">
                        Would you like our AI to rewrite and enhance your uploaded job description?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setUseAiRewrite(true)}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Yes, enhance it
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUseAiRewrite(false)}
                          className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                          No, use as-is
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="2" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Location & Work Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocationSelector
                  locationType={formData.locationType}
                  country={formData.country}
                  state={formData.state}
                  city={formData.city}
                  onLocationChange={handleInputChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="3" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI-Generated Job Post
                    {hasEditedJobPost && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        <Check className="w-3 h-3" />
                        Edited
                      </span>
                    )}
                  </div>
                  {!isGeneratingJobPost && !isEditingJobPost && generatedJob && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditJobPost}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGeneratingJobPost ? (
                  <AiGenerationLoader />
                ) : isEditingJobPost ? (
                  <RichTextEditor
                    value={editedJobPost}
                    onChange={setEditedJobPost}
                    onSave={handleSaveJobPost}
                    onCancel={handleCancelJobPostEdit}
                    placeholder="Edit your job post content..."
                  />
                ) : (
                  <div className="prose max-w-none">
                    <div 
                      className="text-sm text-gray-700 bg-gray-50 p-6 rounded-lg border leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: formatContentForDisplay(hasEditedJobPost ? editedJobPost : generatedJob)
                      }}
                    />
                  </div>
                )}
                {step === 3 && !isGeneratingJobPost && !generatedJob && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Next: Generate Your Job Post</h4>
                        <p className="text-sm text-blue-800">
                          Click "Next Step" to generate a professional job posting based on your requirements. You'll be able to review and edit it before creating the skills test.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="4" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    AI-Generated Skills Test
                    {hasEditedSkillsTest && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        <Check className="w-3 h-3" />
                        Edited
                      </span>
                    )}
                  </div>
                  {!isGeneratingSkillsTest && !isEditingSkillsTest && generatedTest && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditSkillsTest}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGeneratingSkillsTest ? (
                  <AiGenerationLoader />
                ) : isEditingSkillsTest ? (
                  <RichTextEditor
                    value={editedSkillsTest}
                    onChange={setEditedSkillsTest}
                    onSave={handleSaveSkillsTest}
                    onCancel={handleCancelSkillsTestEdit}
                    placeholder="Edit your skills test content..."
                  />
                ) : (
                  <div className="prose max-w-none">
                    <div 
                      className="text-sm text-gray-700 bg-gray-50 p-6 rounded-lg border leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: formatContentForDisplay(hasEditedSkillsTest ? editedSkillsTest : generatedTest)
                      }}
                    />
                  </div>
                )}
                {step === 4 && !isGeneratingSkillsTest && !generatedTest && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-900 mb-1">Skills Test Based on Your Job Post</h4>
                        <p className="text-sm text-green-800">
                          Your skills test will be generated based on the final job post content (including any edits you made). This ensures perfect alignment between what you're looking for and how you assess candidates.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || isGeneratingJobPost || isGeneratingSkillsTest}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed || loading || isGeneratingJobPost || isGeneratingSkillsTest}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {step === 4 ? "Publish Role" : "Next Step"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
