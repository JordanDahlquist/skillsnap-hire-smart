
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2 } from "lucide-react";
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
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.type.includes('document')) {
      toast.error('Please upload a PDF or Word document');
      return;
    }
    
    setIsUploading(true);
    try {
      const result = await uploadResumeFile(file);
      
      // Only update resume file and URL, don't auto-fill form fields
      onChange({ 
        ...data, 
        resumeFile: file, 
        resumeUrl: result.url 
      });
      
      // Only auto-fill empty fields, never override user input
      if (result.parsedData) {
        const { personalInfo } = result.parsedData;
        onChange({
          ...data,
          resumeFile: file,
          resumeUrl: result.url,
          // Only fill if the current field is empty
          fullName: data.fullName || personalInfo.name || data.fullName,
          email: data.email || personalInfo.email || data.email,
          phone: data.phone || personalInfo.phone || data.phone,
          location: data.location || personalInfo.location || data.location,
        });
        toast.success('Resume uploaded and empty fields auto-filled');
      } else {
        toast.success('Resume uploaded successfully');
      }
    } catch (error) {
      console.error('Resume upload failed:', error);
      toast.error('Resume upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleRemoveFile = () => {
    onChange({ ...data, resumeFile: null, resumeUrl: null });
  };

  const isValid = data.fullName && data.email && data.resumeUrl;

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Personal Information
          </CardTitle>
          <p className="text-gray-700">
            Tell us about yourself and provide your contact details
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName" className="text-gray-800 font-medium">Full Name *</Label>
              <Input
                id="fullName"
                value={data.fullName}
                onChange={(e) => onChange({ ...data, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-gray-800 font-medium">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => onChange({ ...data, email: e.target.value })}
                placeholder="your.email@example.com"
                className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-gray-800 font-medium">Phone Number</Label>
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => onChange({ ...data, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <Label htmlFor="location" className="text-gray-800 font-medium">Location</Label>
              <Input
                id="location"
                value={data.location}
                onChange={(e) => onChange({ ...data, location: e.target.value })}
                placeholder="City, State"
                className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Professional Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Professional Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="portfolio" className="text-gray-800 font-medium">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  type="url"
                  value={data.portfolioUrl}
                  onChange={(e) => onChange({ ...data, portfolioUrl: e.target.value })}
                  placeholder="https://your-portfolio.com"
                  className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin" className="text-gray-800 font-medium">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={data.linkedinUrl}
                  onChange={(e) => onChange({ ...data, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/yourname"
                  className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <Label htmlFor="github" className="text-gray-800 font-medium">GitHub Profile</Label>
                <Input
                  id="github"
                  type="url"
                  value={data.githubUrl}
                  onChange={(e) => onChange({ ...data, githubUrl: e.target.value })}
                  placeholder="https://github.com/yourusername"
                  className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div>
            <Label className="text-gray-800 font-medium">Resume Upload *</Label>
            {!data.resumeUrl ? (
              <div
                className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors bg-white ${
                  dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Uploading resume...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                      id="resume-upload"
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('resume-upload')?.click()}
                      className="mb-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      disabled={isUploading}
                    >
                      Choose Resume File
                    </Button>
                    <p className="text-sm text-gray-600">
                      PDF, DOC, or DOCX files only. Drag and drop or click to upload.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">{data.resumeFile?.name || 'Resume uploaded'}</p>
                    <p className="text-xs text-green-700">Resume uploaded successfully</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-gray-800 hover:text-red-700 hover:bg-red-50 border border-gray-300 bg-white"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <Label htmlFor="coverLetter" className="text-gray-800 font-medium">Cover Letter / Introduction</Label>
            <Textarea
              id="coverLetter"
              value={data.coverLetter}
              onChange={(e) => onChange({ ...data, coverLetter: e.target.value })}
              rows={4}
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isValid || isUploading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
};
