
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UnifiedJobFormData, UnifiedJobCreatorActions, CompanyAnalysisData } from "@/types/jobForm";
import { Globe, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Step1JobOverviewProps {
  formData: UnifiedJobFormData;
  actions: UnifiedJobCreatorActions;
  isAnalyzingWebsite?: boolean;
  websiteAnalysisData?: CompanyAnalysisData | null;
  websiteAnalysisError?: string | null;
}

export const Step1JobOverview = ({
  formData,
  actions,
  isAnalyzingWebsite = false,
  websiteAnalysisData,
  websiteAnalysisError
}: Step1JobOverviewProps) => {
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
        <CardTitle className="text-lg">Job Overview</CardTitle>
        <p className="text-sm text-gray-600">Start by describing what you're looking for and your company website</p>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Job Overview Section */}
        <div>
          <Label htmlFor="jobOverview" className="text-sm font-medium">What job are you creating? *</Label>
          <Textarea
            id="jobOverview"
            value={formData.jobOverview}
            onChange={(e) => actions.updateFormData('jobOverview', e.target.value)}
            placeholder="e.g. Senior React Developer for a marketing agency in LA"
            className="mt-2"
            rows={3}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Provide a brief description of the role and company context</p>
        </div>

        {/* Company Website Section */}
        <div>
          <Label htmlFor="companyWebsite" className="text-sm font-medium">Company Website (Optional)</Label>
          <div className="flex gap-2 mt-2">
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
          <p className="text-xs text-gray-500 mt-1">We'll analyze your website to better understand your company</p>
          
          {/* Analysis Status */}
          {isAnalyzingWebsite && (
            <div className="flex items-center gap-2 mt-3 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing website...
            </div>
          )}
          
          {websiteAnalysisData && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
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
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" />
                {websiteAnalysisError}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
