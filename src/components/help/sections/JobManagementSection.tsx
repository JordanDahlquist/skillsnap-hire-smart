
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const JobManagementSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Creating and Managing Jobs</CardTitle>
          <CardDescription>Learn how to create effective job postings and manage your listings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Creating a New Job</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Step 1: Basic Information</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Enter job title, company name, and description</li>
                  <li>• Select employment type (project, full-time, part-time, contract)</li>
                  <li>• Set experience level and required skills</li>
                  <li>• Add budget/salary information and location details</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Step 2: AI Job Post Generation</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• AI generates a professional job description based on your input</li>
                  <li>• Review and edit the generated content as needed</li>
                  <li>• The AI optimizes for clarity and attractiveness to candidates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Step 3: Skills Assessment (Optional)</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• AI generates relevant technical questions</li>
                  <li>• Choose between multiple choice, coding, or essay questions</li>
                  <li>• Set completion time limits and instructions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Step 4: Video Interview Questions (Optional)</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• AI creates role-specific interview questions</li>
                  <li>• Set video response time limits</li>
                  <li>• Customize questions to match your company culture</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Job Status Management</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <Badge variant="secondary" className="mb-2">Draft</Badge>
                <p className="text-sm text-gray-600">Job is saved but not visible to candidates. Continue editing before publishing.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Badge variant="default" className="mb-2">Active</Badge>
                <p className="text-sm text-gray-600">Job is live and accepting applications. Visible on public job board.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Badge variant="outline" className="mb-2">Paused</Badge>
                <p className="text-sm text-gray-600">Temporarily hidden from public view while keeping existing applications.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Writing Effective Job Titles</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Be specific and clear (e.g., "Senior React Developer" vs "Developer")</li>
                  <li>• Include seniority level when relevant</li>
                  <li>• Avoid jargon or internal company terms</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Skills and Requirements</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Separate "must-have" from "nice-to-have" skills</li>
                  <li>• Be realistic about experience requirements</li>
                  <li>• Include both technical and soft skills</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
