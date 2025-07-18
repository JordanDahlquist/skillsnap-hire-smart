
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { uploadResumeFile } from "@/utils/resumeUploadUtils";
import { PersonalInfo } from "@/types/jobForm";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PersonalInfoForm = ({ data, onChange, onNext, onBack }: PersonalInfoFormProps) => {
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Check form validation
  useEffect(() => {
    const isValid = data.fullName.trim() !== '' && data.email.trim() !== '';
    setIsFormValid(isValid);
  }, [data]);

  const handleInputChange = (field: keyof PersonalInfo, value: string | File | null) => {
    onChange({ ...data, [field]: value });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error("Please upload a PDF or Word document.");
      return;
    }

    setIsUploadingResume(true);
    try {
      const result = await uploadResumeFile(file);
      
      onChange({
        ...data,
        resumeFile: file,
        resumeUrl: result.url
      });
      
      // Only auto-fill empty fields
      if (result.parsedData) {
        const { personalInfo } = result.parsedData;
        onChange({
          ...data,
          resumeFile: file,
          resumeUrl: result.url,
          fullName: data.fullName || personalInfo.name || data.fullName,
          email: data.email || personalInfo.email || data.email,
          phone: data.phone || personalInfo.phone || data.phone,
          location: data.location || personalInfo.location || data.location,
        });
        
        toast.success("Resume uploaded and form auto-filled successfully!");
      } else {
        toast.success("Resume uploaded successfully!");
      }
    } catch (error) {
      console.error('Resume upload failed:', error);
      toast.error(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleNext = () => {
    if (!isFormValid) {
      toast.error("Please fill in all required fields (Name and Email).");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Personal Information
          </CardTitle>
          <p className="text-gray-700">
            Tell us about yourself and upload your resume
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resume Upload Section */}
          <div className="space-y-4">
            <Label htmlFor="resume" className="text-sm font-medium">
              Resume Upload (Optional)
            </Label>
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
                className="flex items-center gap-2 bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {isUploadingResume ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploadingResume ? "Uploading..." : "Choose Resume File"}
              </Button>
              {data.resumeUrl && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Resume uploaded successfully
                </span>
              )}
            </div>
          </div>

          {/* Personal Information Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={data.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={data.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, State/Country"
                className="mt-1"
              />
            </div>
          </div>

          {/* Professional Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Professional Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  value={data.portfolioUrl}
                  onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                  placeholder="https://your-portfolio.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={data.linkedinUrl}
                  onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                type="url"
                value={data.githubUrl}
                onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                placeholder="https://github.com/your-username"
                className="mt-1"
              />
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              value={data.coverLetter}
              onChange={(e) => handleInputChange("coverLetter", e.target.value)}
              placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
              rows={4}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <Button 
          onClick={handleNext}
          disabled={!isFormValid}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
