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
import { Loader2, Sparkles, FileText, Users, MapPin, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LocationSelector } from "./LocationSelector";
import { PdfUpload } from "./PdfUpload";
import { AiGenerationLoader } from "./AiGenerationLoader";

interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateRoleModal = ({ open, onOpenChange }: CreateRoleModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    roleType: "",
    employmentType: "",
    experience: "",
    duration: "",
    budget: "",
    skills: "",
    locationType: "remote",
    country: "",
    state: "",
    region: "",
    city: "",
  });
  const [uploadedPdf, setUploadedPdf] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [useAiRewrite, setUseAiRewrite] = useState<boolean | null>(null);
  const [generatedJob, setGeneratedJob] = useState("");
  const [generatedTest, setGeneratedTest] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const generateJobContent = async () => {
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        description: uploadedPdf && !useAiRewrite ? uploadedPdf : formData.description,
        isPdfUpload: !!uploadedPdf,
        useAiRewrite: useAiRewrite
      };

      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: { jobData }
      });

      if (error) throw error;

      setGeneratedJob(data.jobPost);
      setGeneratedTest(data.test);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating job content:', error);
      toast({
        title: "Error generating content",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
      setIsGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setIsGenerating(true);
      setStep(3);
      // Start generation in the background
      await generateJobContent();
    } else if (step === 3) {
      setStep(4);
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
            region: formData.region || null,
            city: formData.city || null,
            generated_job_post: generatedJob,
            generated_test: generatedTest,
            status: 'active'
          })
          .select()
          .single();

        if (error) throw error;

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
          roleType: "",
          employmentType: "",
          experience: "",
          duration: "",
          budget: "",
          skills: "",
          locationType: "remote",
          country: "",
          state: "",
          region: "",
          city: "",
        });
        setUploadedPdf(null);
        setPdfFileName("");
        setUseAiRewrite(null);
        setGeneratedJob("");
        setGeneratedTest("");
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
    formData.title && (formData.description || uploadedPdf) && formData.roleType && formData.employmentType && formData.experience :
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
                  <Label htmlFor="roleType">Role Type</Label>
                  <Select value={formData.roleType} onValueChange={(value) => handleInputChange("roleType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="marketer">Marketer</SelectItem>
                      <SelectItem value="writer">Writer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                  region={formData.region}
                  city={formData.city}
                  onLocationChange={handleInputChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="3" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI-Generated Job Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <AiGenerationLoader />
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {generatedJob}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="4" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  AI-Generated Skills Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {generatedTest}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || isGenerating}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed || loading || isGenerating}
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
