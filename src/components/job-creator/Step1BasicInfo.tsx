
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UnifiedJobFormData, UnifiedJobCreatorActions } from "@/types/jobForm";
import { Globe, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Step1BasicInfoProps {
  formData: UnifiedJobFormData;
  actions: UnifiedJobCreatorActions;
  isAnalyzingWebsite?: boolean;
  websiteAnalysisData?: any;
  websiteAnalysisError?: string | null;
}

export const Step1BasicInfo = ({
  formData,
  actions,
  isAnalyzingWebsite = false,
  websiteAnalysisData,
  websiteAnalysisError
}: Step1BasicInfoProps) => {
  const isProjectBased = formData.employmentType === 'project';

  const handleWebsiteAnalysis = () => {
    if (formData.companyWebsite) {
      actions.analyzeWebsite(formData.companyWebsite);
    }
  };

  const handleWebsiteChange = (value: string) => {
    actions.updateFormData('companyWebsite', value);
    // Clear previous analysis when URL changes
    if (websiteAnalysisData || websiteAnalysisError) {
      actions.setWebsiteAnalysisData(null);
      actions.setWebsiteAnalysisError(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Basic Job Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName" className="text-sm">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => actions.updateFormData('companyName', e.target.value)}
              placeholder="e.g. TechCorp Inc."
              className="mt-1"
              required
            />
          </div>
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
        </div>

        {/* Company Website with Analysis */}
        <div>
          <Label htmlFor="companyWebsite" className="text-sm">Company Website</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="companyWebsite"
              value={formData.companyWebsite}
              onChange={(e) => handleWebsiteChange(e.target.value)}
              placeholder="e.g. https://company.com"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleWebsiteAnalysis}
              disabled={!formData.companyWebsite || isAnalyzingWebsite}
              className="px-3"
            >
              {isAnalyzingWebsite ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Analysis Status */}
          {isAnalyzingWebsite && (
            <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing website...
            </div>
          )}
          
          {websiteAnalysisData && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                <CheckCircle className="w-4 h-4" />
                Website analyzed successfully
              </div>
              {websiteAnalysisData.summary && (
                <p className="text-sm text-gray-600">{websiteAnalysisData.summary}</p>
              )}
            </div>
          )}
          
          {websiteAnalysisError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" />
                {websiteAnalysisError}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="locationType" className="text-sm">Work Arrangement *</Label>
            <Select value={formData.locationType} onValueChange={(value) => actions.updateFormData('locationType', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select work arrangement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="on-site">On-site</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location" className="text-sm">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => actions.updateFormData('location', e.target.value)}
              placeholder="e.g. New York, NY or Worldwide"
              className="mt-1"
            />
          </div>
        </div>

        <div className={`grid ${isProjectBased ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
          {isProjectBased ? (
            <>
              <div>
                <Label htmlFor="budget" className="text-sm">Budget</Label>
                <Input
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => actions.updateFormData('budget', e.target.value)}
                  placeholder="$50-100/hr or $5k project"
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
            </>
          ) : (
            <div>
              <Label htmlFor="salary" className="text-sm">Salary</Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => actions.updateFormData('salary', e.target.value)}
                placeholder="$100,000 - $120,000 per year"
                className="mt-1"
              />
            </div>
          )}
        </div>
        
        {!isProjectBased && (
          <div>
            <Label htmlFor="benefits" className="text-sm">Benefits</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => actions.updateFormData('benefits', e.target.value)}
              placeholder="e.g. Health insurance, 401(k), paid time off..."
              className="mt-1"
              rows={3}
            />
          </div>
        )}

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
