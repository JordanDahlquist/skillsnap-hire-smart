import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { PdfUpload } from "@/components/PdfUpload";
import { JobFormData, JobCreatorActions } from "./types";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Step1BasicInfoProps {
  formData: JobFormData;
  uploadedPdfContent: string | null;
  pdfFileName: string | null;
  useOriginalPdf: boolean | null;
  actions: JobCreatorActions;
}

export const Step1BasicInfo = ({
  formData,
  uploadedPdfContent,
  pdfFileName,
  useOriginalPdf,
  actions
}: Step1BasicInfoProps) => {
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const handlePdfUpload = (content: string, fileName: string) => {
    console.log('PDF upload successful:', { fileName, contentLength: content.length });
    actions.setUploadedPdfContent(content);
    actions.setPdfFileName(fileName);
    actions.setUseOriginalPdf(null); // Reset choice so user can decide
  };

  const handlePdfRemove = () => {
    console.log('Removing PDF content');
    actions.setUploadedPdfContent(null);
    actions.setPdfFileName(null);
    actions.setUseOriginalPdf(null);
    // Only clear description if it was set from PDF
    if (uploadedPdfContent && formData.description === uploadedPdfContent) {
      actions.updateFormData('description', "");
    }
  };

  const handleKeepOriginal = () => {
    console.log('User chose to keep original PDF content');
    actions.setUseOriginalPdf(true);
    // Don't update the description field - keep original PDF content separate
  };

  const handleAiRewrite = () => {
    console.log('User chose to have AI rewrite PDF content');
    actions.setUseOriginalPdf(false);
    // Update description field with PDF content for AI to rewrite
    if (uploadedPdfContent) {
      actions.updateFormData('description', uploadedPdfContent);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Job Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 h-full overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="title" className="text-sm">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => actions.updateFormData('title', e.target.value)}
              placeholder="e.g. Senior React Developer"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="employmentType" className="text-sm">Employment Type</Label>
            <Select value={formData.employmentType} onValueChange={(value) => actions.updateFormData('employmentType', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="project">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm">Job Description *</Label>
          <p className="text-xs text-gray-500 mb-1">
            {uploadedPdfContent && useOriginalPdf === true 
              ? "PDF content will be used as job description"
              : "Basic info for AI to generate professional job description"
            }
          </p>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => actions.updateFormData('description', e.target.value)}
            placeholder="Describe the role, responsibilities, and requirements..."
            rows={8}
            className="mt-1"
            required
            disabled={uploadedPdfContent && useOriginalPdf === true}
          />
        </div>

        <div className="space-y-1">
          <PdfUpload
            onFileUpload={handlePdfUpload}
            onRemove={handlePdfRemove}
            uploadedFile={pdfFileName}
          />
          
          {uploadedPdfContent && useOriginalPdf === null && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">PDF Content Loaded Successfully</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPdfPreview(!showPdfPreview)}
                  className="text-xs h-5 px-1 text-blue-600 hover:text-blue-800"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {showPdfPreview ? 'Hide' : 'Preview'}
                </Button>
              </div>
              
              {showPdfPreview && (
                <div className="mb-2 p-2 bg-white border rounded text-xs max-h-32 overflow-y-auto">
                  <div className="whitespace-pre-wrap">
                    {uploadedPdfContent.substring(0, 500)}
                    {uploadedPdfContent.length > 500 && '...'}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    Total length: {uploadedPdfContent.length} characters
                  </div>
                </div>
              )}
              
              <p className="text-xs text-blue-700 mb-2">How would you like to use this content?</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleKeepOriginal}
                  className="text-xs h-6 px-2"
                >
                  Keep Original
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAiRewrite}
                  className="text-xs h-6 px-2"
                >
                  Have AI Rewrite
                </Button>
              </div>
            </div>
          )}

          {uploadedPdfContent && useOriginalPdf !== null && (
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-800">
                  {useOriginalPdf 
                    ? "Using original PDF content - will skip AI generation" 
                    : "AI will rewrite PDF content"
                  }
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => actions.setUseOriginalPdf(null)}
                  className="text-xs h-5 px-1 text-green-600 hover:text-green-800"
                >
                  Change
                </Button>
              </div>
            </div>
          )}

          {!uploadedPdfContent && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-3 w-3 text-yellow-600" />
              <AlertDescription className="text-xs text-yellow-800">
                <strong>Tip:</strong> Upload an existing job description PDF to speed up the process, or write your own description above.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="experienceLevel" className="text-sm">Experience Level</Label>
            <Select value={formData.experienceLevel} onValueChange={(value) => actions.updateFormData('experienceLevel', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry-level">Entry Level</SelectItem>
                <SelectItem value="mid-level">Mid Level</SelectItem>
                <SelectItem value="senior-level">Senior Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="budget" className="text-sm">Budget</Label>
            <Input
              id="budget"
              value={formData.budget}
              onChange={(e) => actions.updateFormData('budget', e.target.value)}
              placeholder="$50-100/hr"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="duration" className="text-sm">Duration</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => actions.updateFormData('duration', e.target.value)}
              placeholder="3 months"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="skills" className="text-sm">Required Skills</Label>
          <Input
            id="skills"
            value={formData.skills}
            onChange={(e) => actions.updateFormData('skills', e.target.value)}
            placeholder="React, TypeScript, Node.js..."
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};
