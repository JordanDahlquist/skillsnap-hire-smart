import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Plus, Sparkles, FileText, ClipboardList, MapPin, Loader2, Wand2, CheckCircle, AlertCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGenerateMiniDescription } from "@/hooks/useGenerateMiniDescription";
import { useTabCompletion } from "@/hooks/useTabCompletion";
import { LocationSelector } from "./LocationSelector";
import { RichTextEditor } from "./RichTextEditor";
import { parseMarkdown } from "@/utils/markdownParser";
import { logger } from "@/services/loggerService";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Job title must be at least 2 characters."
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters."
  }),
  experience_level: z.string(),
  required_skills: z.string(),
  budget: z.string().optional(),
  duration: z.string().optional(),
  status: z.string().optional(),
  employment_type: z.string(),
  location_type: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional()
});

interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateRoleModal = ({
  open,
  onOpenChange
}: CreateRoleModalProps) => {
  const { user } = useAuth();
  const { generateMiniDescription } = useGenerateMiniDescription();
  const [activeTab, setActiveTab] = useState("1");
  const [generatedJobPost, setGeneratedJobPost] = useState("");
  const [generatedSkillsTest, setGeneratedSkillsTest] = useState("");
  const [isGeneratingJobPost, setIsGeneratingJobPost] = useState(false);
  const [isGeneratingSkillsTest, setIsGeneratingSkillsTest] = useState(false);
  const [editingJobPost, setEditingJobPost] = useState(false);
  const [editingSkillsTest, setEditingSkillsTest] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      experience_level: "mid-level",
      required_skills: "",
      budget: "",
      duration: "",
      status: "draft",
      employment_type: "full-time",
      location_type: "remote",
      country: "United States",
      state: "California",
      region: "Bay Area",
      city: "San Francisco"
    }
  });

  const {
    tabCompletion,
    allTabsComplete,
    tab3Skipped,
    tab4Skipped,
    setTab3Skipped,
    setTab4Skipped,
    getIncompleteTabsMessage
  } = useTabCompletion(form, generatedJobPost, generatedSkillsTest);

  // Debug logging for auth state
  logger.debug('CreateRoleModal auth state:', {
    user: !!user,
    userId: user?.id,
    allTabsComplete,
    tabCompletion
  });

  const TabTriggerWithStatus = ({
    value,
    children,
    isComplete
  }: {
    value: string;
    children: React.ReactNode;
    isComplete: boolean;
  }) => <TabsTrigger value={value} className="flex items-center gap-2">
      {children}
      {isComplete && <CheckCircle className="w-4 h-4 text-green-500" />}
      {!isComplete && <AlertCircle className="w-4 h-4 text-orange-500" />}
    </TabsTrigger>;

  const handleGenerateJobPost = async () => {
    const formData = form.getValues();
    if (!formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the job title and description first.",
        variant: "destructive"
      });
      return;
    }
    setIsGeneratingJobPost(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'job-post',
          jobData: {
            title: formData.title,
            employmentType: formData.employment_type,
            experience: formData.experience_level,
            duration: formData.duration,
            budget: formData.budget,
            skills: formData.required_skills,
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
      logger.error('Error generating job post:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate job post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingJobPost(false);
    }
  };

  const handleGenerateSkillsTest = async () => {
    if (!generatedJobPost) {
      toast({
        title: "Generate Job Post First",
        description: "Please generate the job post before creating the skills test.",
        variant: "destructive"
      });
      return;
    }
    setIsGeneratingSkillsTest(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-job-content', {
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
      logger.error('Error generating skills test:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate skills test. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSkillsTest(false);
    }
  };

  const handleSkipJobPost = () => {
    setTab3Skipped(true);
    toast({
      title: "Job Post Skipped",
      description: "You can publish without AI-generated job post content."
    });
  };

  const handleSkipSkillsTest = () => {
    setTab4Skipped(true);
    toast({
      title: "Skills Test Skipped",
      description: "You can publish without AI-generated skills test."
    });
  };

  const submitJob = async (values: z.infer<typeof formSchema>, status: 'draft' | 'active') => {
    logger.debug('submitJob called with:', {
      values,
      status
    });
    logger.debug('Auth state at submit:', {
      user: !!user,
      userId: user?.id
    });

    if (!user?.id) {
      logger.error('No user ID available');
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a job.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const jobData = {
        title: values.title,
        description: values.description,
        role_type: values.employment_type,
        experience_level: values.experience_level,
        required_skills: values.required_skills,
        budget: values.budget,
        duration: values.duration,
        user_id: user.id,
        status: status,
        employment_type: values.employment_type,
        location_type: values.location_type,
        country: values.country,
        state: values.state,
        region: values.region,
        city: values.city,
        generated_job_post: generatedJobPost || null,
        generated_test: generatedSkillsTest || null
      };

      logger.debug('Submitting job data:', jobData);

      const {
        data,
        error
      } = await supabase.from('jobs').insert([jobData]).select().single();

      if (error) {
        logger.error('Error creating job:', error);
        throw error;
      }

      logger.debug('Job created successfully:', data);

      toast({
        title: status === 'active' ? "Job Published!" : "Draft Saved!",
        description: status === 'active' ? "Your job is now live and accepting applications!" : "Job saved as draft successfully!"
      });

      if (data.id) {
        await generateMiniDescription({
          id: data.id,
          title: values.title,
          description: values.description,
          role_type: values.employment_type
        });
      }

      // Reset form and state
      form.reset();
      setGeneratedJobPost("");
      setGeneratedSkillsTest("");
      setTab3Skipped(false);
      setTab4Skipped(false);
      setActiveTab("1");
      onOpenChange(false);
    } catch (error) {
      logger.error('Error in job creation:', error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitAsDraft = async () => {
    logger.debug('Draft button clicked');
    const isValid = await form.trigger();
    logger.debug('Form validation result for draft:', isValid);
    if (isValid) {
      const values = form.getValues();
      await submitJob(values, 'draft');
    } else {
      logger.debug('Form validation failed for draft');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
    }
  };

  const onSubmitAsPublished = async () => {
    logger.debug('Publish button clicked');
    logger.debug('All tabs complete:', allTabsComplete);
    if (!allTabsComplete) {
      toast({
        title: "Incomplete Form",
        description: getIncompleteTabsMessage(),
        variant: "destructive"
      });
      return;
    }
    const isValid = await form.trigger();
    logger.debug('Form validation result for publish:', isValid);
    if (isValid) {
      const values = form.getValues();
      await submitJob(values, 'active');
    } else {
      logger.debug('Form validation failed for publish');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
    }
  };

  const handleLocationChange = (field: string, value: string) => {
    form.setValue(field as any, value);
  };

  const handleJobPostSave = () => {
    setEditingJobPost(false);
    toast({
      title: "Job Post Updated",
      description: "Your changes have been saved."
    });
  };

  const handleJobPostCancel = () => {
    setEditingJobPost(false);
  };

  const handleSkillsTestSave = () => {
    setEditingSkillsTest(false);
    toast({
      title: "Skills Test Updated",
      description: "Your changes have been saved."
    });
  };

  const handleSkillsTestCancel = () => {
    setEditingSkillsTest(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Create AI-Powered Job
          </DialogTitle>
          <DialogDescription>
            Create a professional job posting with AI-generated content and skills assessments.
          </DialogDescription>
        </DialogHeader>

        {!allTabsComplete && <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{getIncompleteTabsMessage()}</span>
            </div>
          </div>}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabTriggerWithStatus value="1" isComplete={tabCompletion.tab1Complete}>
              <FileText className="w-4 h-4" />
              Role Details
            </TabTriggerWithStatus>
            <TabTriggerWithStatus value="2" isComplete={tabCompletion.tab2Complete}>
              <MapPin className="w-4 h-4" />
              Location
            </TabTriggerWithStatus>
            <TabTriggerWithStatus value="3" isComplete={tabCompletion.tab3Complete}>
              <Wand2 className="w-4 h-4" />
              AI Job Post
            </TabTriggerWithStatus>
            <TabTriggerWithStatus value="4" isComplete={tabCompletion.tab4Complete}>
              <ClipboardList className="w-4 h-4" />
              Skills Test
            </TabTriggerWithStatus>
          </TabsList>

          <Form {...form}>
            <form className="space-y-6">
              <TabsContent value="1" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField control={form.control} name="title" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="employment_type" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Employment Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employment type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="temporary">Temporary</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="experience_level" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="entry-level">Entry Level</SelectItem>
                              <SelectItem value="mid-level">Mid Level</SelectItem>
                              <SelectItem value="senior-level">Senior Level</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>} />
                  </div>

                  <div className="space-y-4">
                    <FormField control={form.control} name="required_skills" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Required Skills</FormLabel>
                          <FormControl>
                            <Input placeholder="JavaScript, React, Node.js" {...field} />
                          </FormControl>
                          <FormDescription>
                            Separate skills with commas.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="budget" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Budget (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="$80,000 - $120,000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="duration" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Duration (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="3 months" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="status" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select job status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>} />
                  </div>
                </div>

                <FormField control={form.control} name="description" render={({
                field
              }) => <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Write a detailed job description here." className="resize-none" rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </TabsContent>

              <TabsContent value="2" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Location & Work Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LocationSelector locationType={form.watch("location_type") || "remote"} country={form.watch("country") || ""} state={form.watch("state") || ""} city={form.watch("city") || ""} onLocationChange={handleLocationChange} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="3" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-purple-600" />
                        AI-Generated Job Post
                        {tab3Skipped && <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Skipped
                          </span>}
                      </div>
                      <div className="flex gap-2">
                        {!generatedJobPost && !tab3Skipped && <>
                            <Button type="button" onClick={handleGenerateJobPost} disabled={isGeneratingJobPost} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                              {isGeneratingJobPost ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                              Generate Job Post
                            </Button>
                            <Button type="button" onClick={handleSkipJobPost} variant="outline">
                              <X className="w-4 h-4 mr-2" />
                              Skip
                            </Button>
                          </>}
                        {generatedJobPost && !editingJobPost && <Button type="button" onClick={() => setEditingJobPost(true)} variant="outline" size="sm">
                            Edit Content
                          </Button>}
                        {generatedJobPost && !editingJobPost && <Button type="button" onClick={handleGenerateJobPost} disabled={isGeneratingJobPost} variant="outline" size="sm">
                            {isGeneratingJobPost ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            Regenerate
                          </Button>}
                        {tab3Skipped && <Button type="button" onClick={() => setTab3Skipped(false)} variant="outline" size="sm">
                            Undo Skip
                          </Button>}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!generatedJobPost && !isGeneratingJobPost && !tab3Skipped && <div className="text-center py-12 text-gray-500">
                        <Wand2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg mb-2">Ready to create magic?</p>
                        <p className="text-sm">Fill in the role details and generate an AI-powered job posting.</p>
                      </div>}
                    
                    {tab3Skipped && <div className="text-center py-12 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-lg mb-2">Job Post Skipped</p>
                        <p className="text-sm">You can publish without AI-generated content.</p>
                      </div>}
                    
                    {isGeneratingJobPost && <div className="text-center py-12">
                        <div className="animate-pulse flex flex-col items-center">
                          <Sparkles className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                          <p className="text-lg font-medium">AI is crafting your job post...</p>
                          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                        </div>
                      </div>}
                    
                    {generatedJobPost && !editingJobPost && <div className="min-h-[300px] p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 prose max-w-none" dangerouslySetInnerHTML={{
                    __html: parseMarkdown(generatedJobPost)
                  }} />}
                    
                    {generatedJobPost && editingJobPost && <RichTextEditor value={generatedJobPost} onChange={setGeneratedJobPost} onSave={handleJobPostSave} onCancel={handleJobPostCancel} placeholder="Edit your job posting content here..." />}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="4" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-green-600" />
                        AI-Generated Skills Test
                        {tab4Skipped && <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Skipped
                          </span>}
                      </div>
                      <div className="flex gap-2">
                        {generatedJobPost && !generatedSkillsTest && !tab4Skipped && <>
                            <Button type="button" onClick={handleGenerateSkillsTest} disabled={isGeneratingSkillsTest} className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                              {isGeneratingSkillsTest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                              Generate Skills Test
                            </Button>
                            <Button type="button" onClick={handleSkipSkillsTest} variant="outline">
                              <X className="w-4 h-4 mr-2" />
                              Skip
                            </Button>
                          </>}
                        {generatedSkillsTest && !editingSkillsTest && <Button type="button" onClick={() => setEditingSkillsTest(true)} variant="outline" size="sm">
                            Edit Test
                          </Button>}
                        {generatedSkillsTest && !editingSkillsTest && <Button type="button" onClick={handleGenerateSkillsTest} disabled={isGeneratingSkillsTest} variant="outline" size="sm">
                            {isGeneratingSkillsTest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            Regenerate
                          </Button>}
                        {tab4Skipped && <Button type="button" onClick={() => setTab4Skipped(false)} variant="outline" size="sm">
                            Undo Skip
                          </Button>}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!generatedJobPost && <div className="text-center py-12 text-gray-500">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg mb-2">Job Post Required</p>
                        <p className="text-sm">Generate the job post first to create a relevant skills test.</p>
                      </div>}
                    
                    {generatedJobPost && !generatedSkillsTest && !isGeneratingSkillsTest && !tab4Skipped && <div className="text-center py-12 text-gray-500">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg mb-2">Ready for Skills Assessment</p>
                        <p className="text-sm">Generate AI-powered assessment questions based on your job post.</p>
                      </div>}
                    
                    {tab4Skipped && <div className="text-center py-12 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-lg mb-2">Skills Test Skipped</p>
                        <p className="text-sm">You can publish without AI-generated skills test.</p>
                      </div>}
                    
                    {isGeneratingSkillsTest && <div className="text-center py-12">
                        <div className="animate-pulse flex flex-col items-center">
                          <Sparkles className="w-12 h-12 text-green-600 animate-spin mb-4" />
                          <p className="text-lg font-medium">AI is creating your skills test...</p>
                          <p className="text-sm text-gray-500 mt-2">Crafting relevant assessment questions</p>
                        </div>
                      </div>}
                    
                    {generatedSkillsTest && !editingSkillsTest && <div className="min-h-[300px] p-4 border rounded-lg bg-gradient-to-br from-green-50 to-teal-50 prose max-w-none" dangerouslySetInnerHTML={{
                    __html: parseMarkdown(generatedSkillsTest)
                  }} />}
                    
                    {generatedSkillsTest && editingSkillsTest && <RichTextEditor value={generatedSkillsTest} onChange={setGeneratedSkillsTest} onSave={handleSkillsTestSave} onCancel={handleSkillsTestCancel} placeholder="Edit your skills test questions here..." />}
                  </CardContent>
                </Card>
              </TabsContent>

              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  {activeTab !== "1" && <Button type="button" variant="outline" onClick={() => setActiveTab((parseInt(activeTab) - 1).toString())}>
                      Previous
                    </Button>}
                  {activeTab !== "4" && <Button type="button" variant="outline" onClick={() => setActiveTab((parseInt(activeTab) + 1).toString())}>
                      Next
                    </Button>}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" disabled={isSaving} onClick={onSubmitAsDraft}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                    Save as Draft
                  </Button>
                  <Button type="button" disabled={isSaving || !allTabsComplete} onClick={onSubmitAsPublished} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Publish Job
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
