
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
import { Loader2, Sparkles, FileText, Users } from "lucide-react";

interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateRoleModal = ({ open, onOpenChange }: CreateRoleModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    roleType: "",
    experience: "",
    duration: "",
    budget: "",
    skills: "",
  });
  const [generatedJob, setGeneratedJob] = useState("");
  const [generatedTest, setGeneratedTest] = useState("");
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateJobPost = async () => {
    setLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      const jobPost = `🚀 ${formData.title} - ${formData.experience} Level

We're looking for a talented ${formData.title.toLowerCase()} to join our team for a ${formData.duration} project.

**What you'll do:**
${formData.description}

**Required skills:**
${formData.skills.split(',').map(skill => `• ${skill.trim()}`).join('\n')}

**Project details:**
• Duration: ${formData.duration}
• Budget: ${formData.budget}
• Experience level: ${formData.experience}

Ready to show us what you can do? Complete the skills test below!`;

      setGeneratedJob(jobPost);
      setLoading(false);
    }, 2000);
  };

  const generateTest = async () => {
    setLoading(true);
    // Simulate AI test generation
    setTimeout(() => {
      const test = `**Skills Assessment for ${formData.title}**

**Question 1: Practical Challenge (60 minutes)**
${formData.roleType === "developer" ? 
  "Build a simple task management component with React. Include add, edit, delete, and mark complete functionality. Focus on clean code and user experience." :
  formData.roleType === "designer" ?
  "Design a mobile-first landing page for a productivity app. Include wireframes and high-fidelity mockups. Show your process from concept to final design." :
  "Create a content strategy for a B2B SaaS startup launching their first product. Include target audience analysis, content calendar for first month, and 3 sample pieces."
}

**Question 2: Problem Solving (30 minutes)**
${formData.roleType === "developer" ?
  "Describe how you would optimize a React app that's loading slowly. What tools would you use to identify bottlenecks?" :
  formData.roleType === "designer" ?
  "A client wants their checkout process to convert better. Walk through your research and design process." :
  "A client's blog traffic has plateaued. What's your 90-day plan to increase organic traffic by 50%?"
}

**Question 3: Communication (15 minutes)**
Tell us about a challenging project you worked on. What obstacles did you face and how did you overcome them?

**Submission Instructions:**
• Complete all questions
• Include relevant work samples
• Estimated time: 2 hours maximum`;

      setGeneratedTest(test);
      setLoading(false);
    }, 2000);
  };

  const handleNext = () => {
    if (step === 1) {
      generateJobPost();
      setStep(2);
    } else if (step === 2) {
      generateTest();
      setStep(3);
    } else {
      // Create the role
      toast({
        title: "Role created successfully!",
        description: "Your job posting is now live. We'll notify you when applications come in.",
      });
      onOpenChange(false);
      setStep(1);
      setFormData({
        title: "",
        description: "",
        roleType: "",
        experience: "",
        duration: "",
        budget: "",
        skills: "",
      });
      setGeneratedJob("");
      setGeneratedTest("");
    }
  };

  const canProceed = step === 1 ? 
    formData.title && formData.description && formData.roleType && formData.experience :
    true;

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1" disabled={step < 1}>
              <FileText className="w-4 h-4 mr-2" />
              Role Details
            </TabsTrigger>
            <TabsTrigger value="2" disabled={step < 2}>
              <Sparkles className="w-4 h-4 mr-2" />
              Job Post
            </TabsTrigger>
            <TabsTrigger value="3" disabled={step < 3}>
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
                <div>
                  <Label htmlFor="duration">Project Duration</Label>
                  <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value="1 month">1 month</SelectItem>
                      <SelectItem value="2-3 months">2-3 months</SelectItem>
                      <SelectItem value="3-6 months">3-6 months</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <Select value={formData.budget} onValueChange={(value) => handleInputChange("budget", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$500-$1,000">$500 - $1,000</SelectItem>
                      <SelectItem value="$1,000-$2,500">$1,000 - $2,500</SelectItem>
                      <SelectItem value="$2,500-$5,000">$2,500 - $5,000</SelectItem>
                      <SelectItem value="$5,000-$10,000">$5,000 - $10,000</SelectItem>
                      <SelectItem value="$10,000+">$10,000+</SelectItem>
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
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI-Generated Job Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="ml-2 text-gray-600">Generating your job post...</span>
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

          <TabsContent value="3" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  AI-Generated Skills Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="ml-2 text-gray-600">Creating your skills test...</span>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {generatedTest}
                    </pre>
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
            {step === 3 ? "Publish Role" : "Next Step"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
