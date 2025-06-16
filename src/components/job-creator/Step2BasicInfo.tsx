
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnifiedJobFormData, UnifiedJobCreatorActions, CompanyAnalysisData } from "@/types/jobForm";
import { useEffect } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { toTitleCase, isValidCompanyName } from "./formUtils";

interface Step2BasicInfoProps {
  formData: UnifiedJobFormData;
  actions: UnifiedJobCreatorActions;
  websiteAnalysisData?: CompanyAnalysisData | null;
  isAnalyzingWebsite?: boolean;
}

// Enhanced parsing functions
const extractJobTitleFromOverview = (overview: string): string => {
  const text = overview.toLowerCase();
  
  // Pattern for role + specialist/manager/developer etc.
  const specialistMatch = overview.match(/(\w+\s+)?(\w+)\s+(specialist|manager|developer|designer|analyst|coordinator|director|lead|engineer|consultant)/i);
  if (specialistMatch) {
    return toTitleCase(specialistMatch[0].trim());
  }
  
  // Pattern for senior/junior + role
  const seniorityMatch = overview.match(/(senior|junior|lead|principal|staff)\s+(\w+\s+)?(\w+)/i);
  if (seniorityMatch) {
    return toTitleCase(seniorityMatch[0].trim());
  }
  
  // Common job titles
  const jobTitles = [
    'product manager', 'project manager', 'marketing manager', 'sales manager',
    'software engineer', 'data scientist', 'business analyst', 'ux designer',
    'frontend developer', 'backend developer', 'fullstack developer',
    'marketing specialist', 'hr specialist', 'operations specialist'
  ];
  
  for (const title of jobTitles) {
    if (text.includes(title)) {
      return toTitleCase(title);
    }
  }
  
  return '';
};

const extractCompanyNameFromOverview = (overview: string): string => {
  // Patterns: "for [Company]", "at [Company]", "with [Company]"
  const patterns = [
    /for\s+([A-Z][a-zA-Z\s&,.-]+)(?:\s+(?:in|at|located))/i,
    /at\s+([A-Z][a-zA-Z\s&,.-]+)(?:\s+(?:in|at|located))/i,
    /with\s+([A-Z][a-zA-Z\s&,.-]+)(?:\s+(?:in|at|located))/i,
    /for\s+([A-Z][a-zA-Z\s&,.-]+)$/i,
    /at\s+([A-Z][a-zA-Z\s&,.-]+)$/i
  ];
  
  for (const pattern of patterns) {
    const match = overview.match(pattern);
    if (match) {
      let companyName = match[1].trim();
      // Remove generic words
      companyName = companyName.replace(/\s+(company|corp|inc|llc|agency|startup|firm|consulting|services)$/i, '');
      if (companyName.length > 2 && isValidCompanyName(companyName)) {
        return companyName;
      }
    }
  }
  
  return '';
};

const extractLocationFromOverview = (overview: string): { location: string; state: string; city: string } => {
  // Pattern for "in [City] [State]" or "in [City], [State]"
  const locationPattern = /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)[,\s]+([A-Z]{2}|[A-Z][a-z]+)/i;
  const match = overview.match(locationPattern);
  
  if (match) {
    const city = match[1].trim();
    const state = match[2].trim();
    return {
      location: `${city}, ${state}`,
      city: city,
      state: state
    };
  }
  
  // Handle formats like "Orange County CA" → "Orange County, CA"
  const countyPattern = /in\s+([A-Z][a-z]+\s+County)\s+([A-Z]{2})/i;
  const countyMatch = overview.match(countyPattern);
  if (countyMatch) {
    const city = countyMatch[1].trim();
    const state = countyMatch[2].trim();
    return {
      location: `${city}, ${state}`,
      city: city,
      state: state
    };
  }
  
  // Simple city extraction
  const simpleCityPattern = /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i;
  const simpleMatch = overview.match(simpleCityPattern);
  if (simpleMatch) {
    const location = simpleMatch[1].trim();
    return {
      location: location,
      city: location,
      state: ''
    };
  }
  
  return { location: '', city: '', state: '' };
};

export const Step2BasicInfo = ({
  formData,
  actions,
  websiteAnalysisData,
  isAnalyzingWebsite = false
}: Step2BasicInfoProps) => {
  const isProjectBased = formData.employmentType === 'project';

  // Enhanced auto-population logic
  useEffect(() => {
    let hasUpdates = false;
    const updates: Partial<UnifiedJobFormData> = {};

    // Extract job title if not set
    if (formData.jobOverview && !formData.title) {
      const extractedTitle = extractJobTitleFromOverview(formData.jobOverview);
      if (extractedTitle) {
        updates.title = extractedTitle;
        hasUpdates = true;
      }
    }

    // Extract company name - prioritize website analysis over job overview
    if (!formData.companyName) {
      if (websiteAnalysisData?.companyName && isValidCompanyName(websiteAnalysisData.companyName)) {
        updates.companyName = websiteAnalysisData.companyName;
        hasUpdates = true;
      } else if (formData.jobOverview) {
        const extractedCompany = extractCompanyNameFromOverview(formData.jobOverview);
        if (extractedCompany && isValidCompanyName(extractedCompany)) {
          updates.companyName = extractedCompany;
          hasUpdates = true;
        }
      }
    }

    // Extract location information
    if (formData.jobOverview && !formData.location) {
      const locationInfo = extractLocationFromOverview(formData.jobOverview);
      if (locationInfo.location) {
        updates.location = locationInfo.location;
        if (locationInfo.city) updates.city = locationInfo.city;
        if (locationInfo.state) updates.state = locationInfo.state;
        hasUpdates = true;
      }
    }

    // Use website analysis data for location if available
    if (websiteAnalysisData?.location && !formData.location) {
      updates.location = websiteAnalysisData.location;
      hasUpdates = true;
    }

    // Apply all updates at once
    if (hasUpdates) {
      Object.entries(updates).forEach(([field, value]) => {
        actions.updateFormData(field as keyof UnifiedJobFormData, value);
      });
    }

  }, [formData.jobOverview, websiteAnalysisData, formData.title, formData.companyName, formData.location, actions]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Job Details</CardTitle>
        <p className="text-sm text-gray-600">Review and edit the job information below</p>
        
        {/* Website Analysis Status */}
        {isAnalyzingWebsite && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing website to help fill out details...
          </div>
        )}
        
        {websiteAnalysisData && !isAnalyzingWebsite && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-md">
            <CheckCircle className="w-4 h-4" />
            Website analyzed successfully - form has been pre-filled with company information
          </div>
        )}
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
            <Input
              id="benefits"
              value={formData.benefits}
              onChange={(e) => actions.updateFormData('benefits', e.target.value)}
              placeholder="e.g. Health insurance, 401(k), paid time off..."
              className="mt-1"
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
