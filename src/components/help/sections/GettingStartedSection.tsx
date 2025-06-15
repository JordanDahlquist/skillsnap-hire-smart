
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const GettingStartedSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Platform</CardTitle>
          <CardDescription>Your complete guide to getting started with hiring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Start Guide</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-medium">Complete Your Profile</h4>
                  <p className="text-sm text-gray-600">Go to Profile Settings to add your company information, set hiring preferences, and customize email templates.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-medium">Create Your First Job</h4>
                  <p className="text-sm text-gray-600">Click "Create Job" to post your first position. Our AI will help generate job descriptions, skills tests, and interview questions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-medium">Review Applications</h4>
                  <p className="text-sm text-gray-600">As applications come in, use our dashboard to review candidates, rate them, and manage your hiring pipeline.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <h4 className="font-medium">Communicate with Candidates</h4>
                  <p className="text-sm text-gray-600">Use bulk email features and customizable templates to efficiently communicate with applicants.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Key Features Overview</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">AI-Powered Job Creation</h4>
                <p className="text-sm text-gray-600">Generate professional job descriptions, skills assessments, and interview questions using AI.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Smart Candidate Screening</h4>
                <p className="text-sm text-gray-600">AI analyzes resumes and provides ratings to help you identify top candidates quickly.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Pipeline Management</h4>
                <p className="text-sm text-gray-600">Track candidates through customizable hiring stages with visual pipeline views.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Bulk Communications</h4>
                <p className="text-sm text-gray-600">Send personalized emails to multiple candidates at once with customizable templates.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
