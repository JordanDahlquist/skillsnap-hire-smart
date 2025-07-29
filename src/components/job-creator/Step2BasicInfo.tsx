
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnifiedJobFormData, UnifiedJobCreatorActions, CompanyAnalysisData } from "@/types/jobForm";
import { useEffect, useRef } from "react";
import { Loader2, CheckCircle, Sparkles, Crown } from "lucide-react";
import { createAIAutoPopulateFunction } from "./enhancedAutoPopulation";

interface Step2BasicInfoProps {
  formData: UnifiedJobFormData;
  actions: UnifiedJobCreatorActions;
  websiteAnalysisData?: CompanyAnalysisData | null;
  isAnalyzingWebsite?: boolean;
}

export const Step2BasicInfo = ({
  formData,
  actions,
  websiteAnalysisData,
  isAnalyzingWebsite = false
}: Step2BasicInfoProps) => {
  const isProjectBased = formData.employmentType === 'project';
  const isExecutiveRole = formData.experienceLevel === 'executive';
  const hasAutoPopulated = useRef(false);
  const lastOverview = useRef('');
  const lastWebsiteData = useRef<CompanyAnalysisData | null>(null);
  const aiAutoPopulate = createAIAutoPopulateFunction();

  // AI-powered auto-population with fallback to regex
  useEffect(() => {
    // Don't auto-populate while website analysis is in progress
    if (isAnalyzingWebsite) {
      return;
    }

    // Check if we should run auto-population
    const overviewChanged = formData.jobOverview.trim() && formData.jobOverview !== lastOverview.current;
    const websiteDataChanged = websiteAnalysisData !== lastWebsiteData.current;
    const shouldRun = overviewChanged || (websiteDataChanged && websiteAnalysisData);
    
    if (!shouldRun) {
      return;
    }

    console.log('Running AI-powered auto-population...');
    console.log('Overview changed:', overviewChanged);
    console.log('Website data changed:', websiteDataChanged);

    // Run AI-powered auto-population
    const runAutoPopulation = async () => {
      try {
        const updates = await aiAutoPopulate(formData.jobOverview, websiteAnalysisData, formData);

        // Apply updates if there are any
        if (Object.keys(updates).length > 0) {
          console.log('Applying AI auto-population updates:', updates);
          Object.entries(updates).forEach(([field, value]) => {
            if (value && typeof value === 'string') {
              actions.updateFormData(field as keyof UnifiedJobFormData, value);
            }
          });

          // Update refs
          hasAutoPopulated.current = true;
          lastOverview.current = formData.jobOverview;
          lastWebsiteData.current = websiteAnalysisData;
        }
      } catch (error) {
        console.error('Auto-population failed:', error);
      }
    };

    runAutoPopulation();
  }, [formData.jobOverview, websiteAnalysisData, actions, formData, isAnalyzingWebsite, aiAutoPopulate]);

  // Reset auto-population flag when overview changes significantly
  useEffect(() => {
    if (formData.jobOverview !== lastOverview.current) {
      hasAutoPopulated.current = false;
    }
  }, [formData.jobOverview]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {isExecutiveRole ? (
            <Crown className="w-5 h-5 text-amber-500" />
          ) : (
            <Sparkles className="w-5 h-5 text-blue-500" />
          )}
          Job Details
          {isExecutiveRole && (
            <span className="text-sm font-normal text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
              Executive Role
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {isExecutiveRole 
            ? "Executive-level position with enhanced compensation and benefits"
            : "Review and edit the auto-populated job information below"
          }
        </p>
        
        {/* Website Analysis Status */}
        {isAnalyzingWebsite && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing website to intelligently populate fields...
          </div>
        )}
        
        {websiteAnalysisData && !isAnalyzingWebsite && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-md">
            <CheckCircle className="w-4 h-4" />
            Website analyzed and form intelligently populated with company information
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
              placeholder={isExecutiveRole ? "e.g. Chief Executive Officer" : "e.g. Senior React Developer"}
              className="mt-1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employmentType" className="text-sm">Employment Type</Label>
            <Select
              value={formData.employmentType}
              onValueChange={(value) => actions.updateFormData('employmentType', value)}
            >
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
            <Select
              value={formData.experienceLevel}
              onValueChange={(value) => actions.updateFormData('experienceLevel', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry-level">Entry Level</SelectItem>
                <SelectItem value="mid-level">Mid Level</SelectItem>
                <SelectItem value="senior-level">Senior Level</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="locationType" className="text-sm">Work Arrangement *</Label>
            <Select
              value={formData.locationType}
              onValueChange={(value) => actions.updateFormData('locationType', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select work arrangement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="office">On-site</SelectItem>
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
              placeholder={isExecutiveRole ? "e.g. San Francisco, CA or Global" : "e.g. New York, NY or Worldwide"}
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
              <Label htmlFor="salary" className="text-sm">
                Salary {isExecutiveRole && <span className="text-amber-600">(Executive Range)</span>}
              </Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => actions.updateFormData('salary', e.target.value)}
                placeholder={
                  isExecutiveRole
                    ? "$200,000 - $500,000 per year"
                    : "$100,000 - $120,000 per year"
                }
                className="mt-1"
              />
            </div>
          )}
        </div>
        
        {!isProjectBased && (
          <div>
            <Label htmlFor="benefits" className="text-sm">
              Benefits {isExecutiveRole && <span className="text-amber-600">(Executive Package)</span>}
            </Label>
            <Input
              id="benefits"
              value={formData.benefits}
              onChange={(e) => actions.updateFormData('benefits', e.target.value)}
              placeholder={
                isExecutiveRole
                  ? "Executive compensation, equity, health insurance, executive perks..."
                  : "Health insurance, 401(k), paid time off..."
              }
              className="mt-1"
            />
          </div>
        )}

        <div>
          <Label htmlFor="skills" className="text-sm">
            Required Skills {isExecutiveRole && <span className="text-amber-600">(Leadership & Strategic)</span>}
          </Label>
          <Input
            id="skills"
            value={formData.skills}
            onChange={(e) => actions.updateFormData('skills', e.target.value)}
            placeholder={
              isExecutiveRole
                ? "Strategic Planning, Leadership, Business Development, Team Management..."
                : "React, TypeScript, Node.js..."
            }
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};
