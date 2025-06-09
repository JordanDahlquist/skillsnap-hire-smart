
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

interface ApplicationFormData {
  name: string;
  email: string;
  portfolio: string;
  resumeUrl: string | null;
  answer1: string;
  answer2: string;
  answer3: string;
  skillsTestResponses: Array<{
    question: string;
    answer: string;
  }>;
  videoUrl: string | null;
}

interface PersonalInfoStepProps {
  formData: ApplicationFormData;
  onFormDataChange: (updates: Partial<ApplicationFormData>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const PersonalInfoStep = ({ 
  formData, 
  onFormDataChange, 
  onValidationChange 
}: PersonalInfoStepProps) => {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Validate the form whenever data changes
  useEffect(() => {
    const isValid = formData.name.trim() !== "" && 
                   formData.email.trim() !== "" && 
                   formData.resumeUrl !== null &&
                   formData.answer1.trim() !== "" &&
                   formData.answer2.trim() !== "" &&
                   formData.answer3.trim() !== "";
    
    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate file upload - in production, upload to Supabase Storage
      const fileName = file.name;
      const filePath = `uploaded/${fileName}`;
      
      onFormDataChange({ resumeUrl: filePath });
      setUploadedFileName(fileName);
      toast.success("Resume uploaded successfully");
    }
  };

  const handleRemoveFile = () => {
    onFormDataChange({ resumeUrl: null });
    setUploadedFileName(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        <p className="text-gray-600 mt-2">
          Tell us about yourself and provide your contact details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => onFormDataChange({ name: e.target.value })}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => onFormDataChange({ email: e.target.value })}
            placeholder="your.email@example.com"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="portfolio">Portfolio URL</Label>
        <Input
          type="url"
          id="portfolio"
          value={formData.portfolio}
          onChange={(e) => onFormDataChange({ portfolio: e.target.value })}
          placeholder="https://your-portfolio.com (optional)"
        />
      </div>

      <div>
        <Label>Resume Upload *</Label>
        <div className="mt-2">
          {!formData.resumeUrl ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('resume-upload')?.click()}
                className="mb-2"
              >
                Choose Resume File
              </Button>
              <p className="text-sm text-gray-500">
                PDF, DOC, or DOCX files only
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    {uploadedFileName || 'Resume uploaded'}
                  </p>
                  <p className="text-xs text-green-600">File uploaded successfully</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="answer1">Why are you a good fit for this role? *</Label>
        <Textarea
          id="answer1"
          value={formData.answer1}
          onChange={(e) => onFormDataChange({ answer1: e.target.value })}
          rows={4}
          placeholder="Explain why you're the right candidate for this position..."
          required
        />
      </div>

      <div>
        <Label htmlFor="answer2">What is your experience in this field? *</Label>
        <Textarea
          id="answer2"
          value={formData.answer2}
          onChange={(e) => onFormDataChange({ answer2: e.target.value })}
          rows={4}
          placeholder="Describe your relevant experience and background..."
          required
        />
      </div>

      <div>
        <Label htmlFor="answer3">What are your salary expectations? *</Label>
        <Textarea
          id="answer3"
          value={formData.answer3}
          onChange={(e) => onFormDataChange({ answer3: e.target.value })}
          rows={4}
          placeholder="Share your salary expectations or rate..."
          required
        />
      </div>
    </div>
  );
};
