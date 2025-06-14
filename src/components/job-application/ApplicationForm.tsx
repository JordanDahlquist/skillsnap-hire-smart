
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadResumeFile } from "@/utils/resumeUploadUtils";

interface ApplicationFormProps {
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
}

export const ApplicationForm = ({ onSubmit, isSubmitting = false }: ApplicationFormProps) => {
  const { toast } = useToast();
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    experience: "",
    portfolio_url: "",
    linkedin_url: "",
    github_url: "",
    cover_letter: "",
    available_start_date: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingResume(true);
    try {
      const result = await uploadResumeFile(file);
      setResumeUrl(result.url);
      
      // Auto-fill form if parsing succeeded
      if (result.parsedData) {
        const { personalInfo, workExperience, skills } = result.parsedData;
        setFormData(prev => ({
          ...prev,
          name: personalInfo.name || prev.name,
          email: personalInfo.email || prev.email,
          phone: personalInfo.phone || prev.phone,
          location: personalInfo.location || prev.location,
          experience: workExperience.map(exp => 
            `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate}): ${exp.description}`
          ).join('\n\n') || prev.experience,
        }));
        
        toast({
          title: "Resume uploaded successfully",
          description: "Your information has been extracted and filled in the form.",
        });
      } else {
        toast({
          title: "Resume uploaded",
          description: "Resume uploaded successfully, but auto-fill failed. Please complete the form manually.",
        });
      }
    } catch (error) {
      console.error('Resume upload failed:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Required fields missing",
        description: "Please fill in your name and email.",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      ...formData,
      resume_file_path: resumeUrl || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resume Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resume Upload (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="resume">Upload your resume to auto-fill the form</Label>
            <div className="flex items-center gap-4">
              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={isUploadingResume}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('resume')?.click()}
                disabled={isUploadingResume}
                className="flex items-center gap-2"
              >
                {isUploadingResume ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploadingResume ? "Uploading..." : "Choose Resume"}
              </Button>
              {resumeUrl && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Resume uploaded successfully
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, State/Country"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="experience">Work Experience</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              placeholder="Describe your relevant work experience..."
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="available_start_date">Available Start Date</Label>
            <Input
              id="available_start_date"
              type="date"
              value={formData.available_start_date}
              onChange={(e) => handleInputChange("available_start_date", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Links & Portfolio */}
      <Card>
        <CardHeader>
          <CardTitle>Links & Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="portfolio_url">Portfolio URL</Label>
            <Input
              id="portfolio_url"
              type="url"
              value={formData.portfolio_url}
              onChange={(e) => handleInputChange("portfolio_url", e.target.value)}
              placeholder="https://your-portfolio.com"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>
            <div>
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => handleInputChange("github_url", e.target.value)}
                placeholder="https://github.com/your-username"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cover Letter */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Letter</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="cover_letter">Why are you interested in this position?</Label>
            <Textarea
              id="cover_letter"
              value={formData.cover_letter}
              onChange={(e) => handleInputChange("cover_letter", e.target.value)}
              placeholder="Tell us why you're a great fit for this role..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting Application...
          </>
        ) : (
          "Submit Application"
        )}
      </Button>
    </form>
  );
};
