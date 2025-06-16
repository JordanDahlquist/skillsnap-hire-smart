
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UnifiedJobFormData, UnifiedJobCreatorActions } from "@/types/jobForm";

interface Step1JobOverviewProps {
  formData: UnifiedJobFormData;
  actions: UnifiedJobCreatorActions;
}

export const Step1JobOverview = ({
  formData,
  actions
}: Step1JobOverviewProps) => {
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
          <Input
            id="companyWebsite"
            value={formData.companyWebsite}
            onChange={(e) => actions.updateFormData('companyWebsite', e.target.value)}
            placeholder="e.g. https://company.com"
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">We'll analyze your website to better understand your company when you proceed to the next step</p>
        </div>
      </CardContent>
    </Card>
  );
};
