
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const CandidateManagementSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Managing Candidates & Applications</CardTitle>
          <CardDescription>Efficiently review, rate, and organize your applicants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Application Review Process</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">AI Rating System</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• AI automatically analyzes resumes and provides 1-3 star ratings</li>
                  <li>• Ratings based on job requirements match and experience relevance</li>
                  <li>• Use as a starting point for your own evaluation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Manual Rating</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Add your own 1-3 star rating after reviewing candidates</li>
                  <li>• Override AI ratings based on your specific criteria</li>
                  <li>• Ratings help prioritize candidates in your pipeline</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Hiring Pipeline Stages</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge variant="secondary">Applied</Badge>
                <span className="text-sm">Initial application received</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge variant="default">Screening</Badge>
                <span className="text-sm">Under initial review</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge variant="default">Interview</Badge>
                <span className="text-sm">Scheduled for interview</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge variant="default">Final Review</Badge>
                <span className="text-sm">Final decision pending</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge className="bg-green-600">Hired</Badge>
                <span className="text-sm">Successfully hired</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge variant="destructive">Rejected</Badge>
                <span className="text-sm">Not moving forward</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Sorting and Filtering</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Sort Options</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Newest First:</strong> Most recent applications</li>
                  <li>• <strong>Oldest First:</strong> Applications needing attention</li>
                  <li>• <strong>Highest Rated:</strong> AI + manual ratings combined</li>
                  <li>• <strong>AI Rating:</strong> Sort by AI analysis only</li>
                  <li>• <strong>Manual Rating:</strong> Sort by your ratings only</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Filter Options</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Pipeline Stage:</strong> View specific stages</li>
                  <li>• <strong>Rating Range:</strong> Filter by star ratings</li>
                  <li>• <strong>Application Date:</strong> Date range filters</li>
                  <li>• <strong>Status:</strong> Active, rejected, pending</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Bulk Actions</h3>
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2">Select Multiple Candidates</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Use checkboxes to select multiple candidates</li>
                  <li>• Apply actions to all selected at once</li>
                  <li>• Change stages, ratings, or send bulk emails</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Candidate Detail View</h3>
            <div className="space-y-3">
              <h4 className="font-medium">Available Information</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• <strong>Overview:</strong> Basic info, ratings, and status</li>
                <li>• <strong>Resume:</strong> Full resume view with AI analysis</li>
                <li>• <strong>Skills Test:</strong> Test results and scores</li>
                <li>• <strong>Video Interview:</strong> Video responses to questions</li>
                <li>• <strong>Documents:</strong> Additional uploaded files</li>
                <li>• <strong>Activity:</strong> Timeline of all interactions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
