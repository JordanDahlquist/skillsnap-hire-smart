
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, DollarSign, Calendar, FileText, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const JobApplication = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      toast({
        title: "Application submitted!",
        description: "Thank you for your application. We'll review it and get back to you soon.",
      });
    }, 1000);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Job Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Senior React Developer</h1>
                <p className="text-lg text-gray-600 mb-4">
                  Join our team to build the next generation of our SaaS platform
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    2-3 months
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    $5,000 - $10,000
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Posted 2 days ago
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Remote
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-3">What you'll do:</h3>
              <p className="text-gray-600 mb-4">
                We're looking for a senior React developer to help us rebuild our dashboard with modern technologies. 
                You'll work closely with our design team to create intuitive user interfaces and implement complex features.
              </p>
              
              <h3 className="text-lg font-semibold mb-3">Required skills:</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {["React", "TypeScript", "Node.js", "Tailwind CSS", "REST APIs"].map((skill) => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
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
              <div>
                <Label className="text-base font-semibold">
                  Question 1: Practical Challenge (60 minutes)
                </Label>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  Build a simple task management component with React. Include add, edit, delete, and mark complete functionality. 
                  Focus on clean code and user experience.
                </p>
                <Textarea
                  placeholder="Share your approach, key decisions, and include relevant code snippets or links to your solution..."
                  value={applicationData.answer1}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, answer1: e.target.value }))}
                  rows={6}
                />
              </div>

              <div>
                <Label className="text-base font-semibold">
                  Question 2: Problem Solving (30 minutes)
                </Label>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  Describe how you would optimize a React app that's loading slowly. What tools would you use to identify bottlenecks?
                </p>
                <Textarea
                  placeholder="Describe your optimization strategy and tools..."
                  value={applicationData.answer2}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, answer2: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <Label className="text-base font-semibold">
                  Question 3: Communication (15 minutes)
                </Label>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  Tell us about a challenging project you worked on. What obstacles did you face and how did you overcome them?
                </p>
                <Textarea
                  placeholder="Share your story..."
                  value={applicationData.answer3}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, answer3: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              type="submit" 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            >
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
