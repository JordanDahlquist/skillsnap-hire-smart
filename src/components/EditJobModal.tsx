import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, FileText, Users, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LocationSelector } from "./LocationSelector";

interface Job {
  id: string;
  title: string;
  description: string;
  role_type: string;
  employment_type?: string;
  experience_level: string;
  duration?: string;
  budget: string;
  required_skills: string;
  location_type?: string;
  country?: string;
  state?: string;
  region?: string;
  city?: string;
  generated_job_post?: string;
  generated_test?: string;
}

interface EditJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  onJobUpdate: () => void;
}

export const EditJobModal = ({ open, onOpenChange, job, onJobUpdate }: EditJobModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    roleType: "",
    employmentType: "",
    experience: "",
    duration: "",
    budgetMin: "",
    budgetMax: "",
    skills: "",
    locationType: "remote",
    country: "",
    state: "",
    city: "",
  });
  const [generatedJob, setGeneratedJob] = useState("");
  const [generatedTest, setGeneratedTest] = useState("");
  const { toast } = useToast();

  // Helper function to parse budget range from stored format
  const parseBudgetRange = (budget: string) => {
    if (!budget) return { min: "", max: "" };
    
    // Handle ranges like "$60,000 - $80,000" or "2000-5000"
    const rangeMatch = budget.match(/^(.+?)\s*-\s*(.+)$/);
    if (rangeMatch) {
      return { min: rangeMatch[1].trim(), max: rangeMatch[2].trim() };
    }
    
    // Handle "Up to X" format
    const upToMatch = budget.match(/^Up to (.+)$/i);
    if (upToMatch) {
      return { min: "", max: upToMatch[1].trim() };
    }
    
    // Single value, put in min field
    return { min: budget, max: "" };
  };

  // Helper function to format budget range for storage
  const formatBudgetRange = (min: string, max: string) => {
    if (!min && !max) return "";
    if (min && !max) return min;
    if (!min && max) return `Up to ${max}`;
    return `${min} - ${max}`;
  };

  // Populate form with existing job data when modal opens
  useEffect(() => {
    if (open && job) {
      const { min, max } = parseBudgetRange(job.budget || "");
      setFormData({
        title: job.title,
        description: job.description,
        roleType: job.role_type,
        employmentType: job.employment_type || "project",
        experience: job.experience_level,
        duration: job.duration || "",
        budgetMin: min,
        budgetMax: max,
        skills: job.required_skills,
        locationType: job.location_type || "remote",
        country: job.country || "",
        state: job.state || "",
        city: job.city || "",
      });
      setGeneratedJob(job.generated_job_post || "");
      setGeneratedTest(job.generated_test || "");
    }
  }, [open, job]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateJobContent = async () => {
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        budget: formatBudgetRange(formData.budgetMin, formData.budgetMax)
      };

      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: { jobData }
      });

      if (error) throw error;

      setGeneratedJob(data.jobPost);
      setGeneratedTest(data.test);
    } catch (error) {
      console.error('Error generating job content:', error);
      toast({
        title: "Error generating content",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      await generateJobContent();
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else {
      // Update the job in database
      setLoading(true);
      try {
        const { error } = await supabase
          .from('jobs')
          .update({
            title: formData.title,
            description: formData.description,
            role_type: formData.roleType,
            employment_type: formData.employmentType,
            experience_level: formData.experience,
            duration: formData.duration || null,
            budget: formatBudgetRange(formData.budgetMin, formData.budgetMax) || null,
            required_skills: formData.skills,
            location_type: formData.locationType,
            country: formData.country || null,
            state: formData.state || null,
            city: formData.city || null,
            generated_job_post: generatedJob,
            generated_test: generatedTest,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        if (error) throw error;

        toast({
          title: "Job updated successfully!",
          description: "Your changes have been saved.",
        });

        onJobUpdate();
        onOpenChange(false);
        setStep(1);
      } catch (error) {
        console.error('Error updating job:', error);
        toast({
          title: "Error updating job",
          description: "Please try again or contact support if the problem persists.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const canProceed = step === 1 ? 
    formData.title && formData.description && formData.employmentType && formData.experience :
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

  const getBudgetPlaceholders = () => {
    switch (formData.employmentType) {
      case 'full-time':
        return { min: 'e.g., $70,000', max: 'e.g., $90,000' };
      case 'part-time':
        return { min: 'e.g., $40/hour', max: 'e.g., $60/hour' };
      case 'contract-to-hire':
        return { min: 'e.g., $4,000/month', max: 'e.g., $6,000/month' };
      default:
        return { min: 'e.g., $2,000', max: 'e.g., $5,000' };
    }
  };

  const getBudgetLabel = () => {
    switch (formData.employmentType) {
      case 'full-time':
        return 'Salary Range (Optional)';
      case 'part-time':
        return 'Hourly Rate Range (Optional)';
      case 'contract-to-hire':
        return 'Contract Budget Range (Optional)';
      default:
        return 'Project Budget Range (Optional)';
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
            Edit Job: {job.title}
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
                    <Label>{getBudgetLabel()}</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder={getBudgetPlaceholders().min}
                          value={formData.budgetMin}
                          onChange={(e) => handleInputChange("budgetMin", e.target.value)}
                        />
                      </div>
                      <div className="flex items-center px-2 text-gray-500">to</div>
                      <div className="flex-1">
                        <Input
                          placeholder={getBudgetPlaceholders().max}
                          value={formData.budgetMax}
                          onChange={(e) => handleInputChange("budgetMax", e.target.value)}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty if you don't want to show compensation details
                    </p>
                  </div>
                )}
              </div>
            </div>

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
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI-Generated Job Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="ml-2 text-gray-600">Regenerating your job post...</span>
                  </div>
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
            disabled={step === 1}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed || loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {step === 4 ? "Save Changes" : "Next Step"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
