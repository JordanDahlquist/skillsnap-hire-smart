import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Plus, CopyCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { generateMiniDescription, generateJobPost, generateTest } from "@/integrations/openai";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Job title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  role_type: z.string().optional(),
  experience_level: z.string(),
  required_skills: z.string(),
  budget: z.string().optional(),
  duration: z.string().optional(),
  status: z.string().optional(),
  employment_type: z.string().optional(),
  location_type: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
});

interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateRoleModal = ({ open, onOpenChange }: CreateRoleModalProps) => {
  const { user, organizationMembership } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJobPost, setGeneratedJobPost] = useState<string | null>(null);
  const [generatedTest, setGeneratedTest] = useState<string | null>(null);
  const [isCopiedPost, setIsCopiedPost] = useState(false);
  const [isCopiedTest, setIsCopiedTest] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      role_type: "full-time",
      experience_level: "mid-level",
      required_skills: "",
      budget: "",
      duration: "",
      status: "draft",
      employment_type: "project",
      location_type: "remote",
      country: "United States",
      state: "California",
      region: "Bay Area",
      city: "San Francisco",
    },
  });

  const { mutate: generateMiniDesc } = useMutation({
    mutationFn: async (description: string) => {
      return await generateMiniDescription(description);
    },
    onSuccess: (data: any) => {
      console.log('Generated mini description:', data);
    },
    onError: (error: any) => {
      console.error('Error generating mini description:', error);
      toast({
        title: "Error",
        description: "Failed to generate mini description. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: generatePost } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      setIsGenerating(true);
      return await generateJobPost(values);
    },
    onSuccess: (data: any) => {
      setIsGenerating(false);
      setGeneratedJobPost(data);
      toast({
        title: "Generated",
        description: "Job post generated successfully!",
      });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      console.error('Error generating job post:', error);
      toast({
        title: "Error",
        description: "Failed to generate job post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: generateAssessment } = useMutation({
    mutationFn: async (description: string) => {
      setIsGenerating(true);
      return await generateTest(description);
    },
    onSuccess: (data: any) => {
      setIsGenerating(false);
      setGeneratedTest(data);
      toast({
        title: "Generated",
        description: "Assessment test generated successfully!",
      });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      console.error('Error generating assessment test:', error);
      toast({
        title: "Error",
        description: "Failed to generate assessment test. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id || !organizationMembership?.organization_id) {
      toast({
        title: "Error",
        description: "You must be logged in and part of an organization to create a job.",
        variant: "destructive",
      });
      return;
    }

    console.log('Creating job with data:', values);
    
    try {
      const jobData = {
        ...values,
        user_id: user.id,
        organization_id: organizationMembership.organization_id,
        status: values.status || 'draft',
        experience_level: values.experience_level,
        employment_type: values.employment_type || 'project',
        location_type: values.location_type,
        country: values.country,
        state: values.state,
        region: values.region,
        city: values.city,
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) {
        console.error('Error creating job:', error);
        throw error;
      }

      console.log('Job created successfully:', data);

      toast({
        title: "Success",
        description: "Job created successfully!",
      });

      generateMiniDesc(values.description);

      if (generatedJobPost) {
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ generated_job_post: generatedJobPost })
          .eq('id', data.id);

        if (updateError) {
          console.error('Error updating job post:', updateError);
          toast({
            title: "Error",
            description: "Failed to update job post. Please try again.",
            variant: "destructive",
          });
        }
      }

      if (generatedTest) {
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ generated_test: generatedTest })
          .eq('id', data.id);

        if (updateError) {
          console.error('Error updating assessment test:', updateError);
          toast({
            title: "Error",
            description: "Failed to update assessment test. Please try again.",
            variant: "destructive",
          });
        }
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in job creation:', error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyPost = () => {
    if (generatedJobPost) {
      navigator.clipboard.writeText(generatedJobPost);
      setIsCopiedPost(true);
      setTimeout(() => setIsCopiedPost(false), 2000);
    }
  };

  const handleCopyTest = () => {
    if (generatedTest) {
      navigator.clipboard.writeText(generatedTest);
      setIsCopiedTest(true);
      setTimeout(() => setIsCopiedTest(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#007af6] hover:bg-[#0056b3] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Create Job</DialogTitle>
          <DialogDescription>
            Create a new job posting to start receiving applications.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="experience_level"
                render={({ field }) => (
                  <FormItem>
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
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
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
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="required_skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="JavaScript, React, Node.js" {...field} />
                  </FormControl>
                  <FormDescription>
                    Separate skills with commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input placeholder="$80,000 - $120,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="3 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a detailed job description here."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="on-site">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
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
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="California" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input placeholder="Bay Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="ai_generate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Generate Job Post with AI</FormLabel>
                      <FormDescription>
                        Generate a job post with AI based on the job description.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {form.getValues("ai_generate") && (
              <div className="space-y-4">
                <Button
                  type="button"
                  className="bg-[#7928CA] hover:bg-[#a756f8] text-white"
                  onClick={() => generatePost(form.getValues())}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      Generating...
                      <svg className="animate-spin h-5 w-5 ml-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </>
                  ) : (
                    "Generate Job Post"
                  )}
                </Button>

                {generatedJobPost && (
                  <div className="space-y-2">
                    <Textarea
                      value={generatedJobPost}
                      className="h-48 resize-none"
                      readOnly
                    />
                    <Button
                      type="button"
                      onClick={handleCopyPost}
                      disabled={isCopiedPost}
                      className="relative"
                    >
                      {isCopiedPost ? (
                        <>
                          <CopyCheck className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <Button
                  type="button"
                  className="bg-[#7928CA] hover:bg-[#a756f8] text-white"
                  onClick={() => generateAssessment(form.getValues("description"))}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      Generating...
                      <svg className="animate-spin h-5 w-5 ml-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </>
                  ) : (
                    "Generate Assessment Test"
                  )}
                </Button>

                {generatedTest && (
                  <div className="space-y-2">
                    <Textarea
                      value={generatedTest}
                      className="h-48 resize-none"
                      readOnly
                    />
                    <Button
                      type="button"
                      onClick={handleCopyTest}
                      disabled={isCopiedTest}
                      className="relative"
                    >
                      {isCopiedTest ? (
                        <>
                          <CopyCheck className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="submit">Create Job</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
