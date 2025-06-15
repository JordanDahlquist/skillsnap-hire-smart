
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const LinkedInIntegrationSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Integration & Candidate Sourcing</CardTitle>
          <CardDescription>Drive quality applicants from LinkedIn to your job postings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Posting Jobs on LinkedIn</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Step 1: Prepare Your Job Post</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Create and publish your job on our platform first</li>
                  <li>• Ensure all details are complete and accurate</li>
                  <li>• Copy the public job URL from your dashboard</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Step 2: Create LinkedIn Job Post</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Go to LinkedIn and create a new job posting</li>
                  <li>• Copy your job description from our platform</li>
                  <li>• Set application method to "External website"</li>
                  <li>• Paste your job URL as the application link</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Optimizing for LinkedIn</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Job Title Best Practices</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use industry-standard titles</li>
                  <li>• Include seniority level clearly</li>
                  <li>• Add location if relevant</li>
                  <li>• Avoid internal company jargon</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Description Optimization</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Lead with compelling value proposition</li>
                  <li>• Use bullet points for easy scanning</li>
                  <li>• Include company culture highlights</li>
                  <li>• End with clear call-to-action</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">LinkedIn Sourcing Strategies</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Active Sourcing</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Use LinkedIn Recruiter or Sales Navigator for advanced search</li>
                  <li>• Search by skills, experience, location, and current company</li>
                  <li>• Send personalized InMail messages with job link</li>
                  <li>• Engage with potential candidates' content first</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Passive Sourcing</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Share job posts in relevant LinkedIn groups</li>
                  <li>• Post on your company LinkedIn page</li>
                  <li>• Ask employees to share with their networks</li>
                  <li>• Use LinkedIn hashtags for discoverability</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Tracking LinkedIn Traffic</h3>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Analytics Available</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Monitor application sources in your dashboard</li>
                <li>• Track conversion rates from LinkedIn views to applications</li>
                <li>• Analyze which LinkedIn strategies work best</li>
                <li>• Compare LinkedIn candidates to other sources</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">LinkedIn Messaging Templates</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Initial Outreach Template</h4>
                <div className="text-sm text-gray-700 font-mono bg-white p-3 rounded border">
                  Hi [Name],<br/><br/>
                  I came across your profile and was impressed by your experience with [specific skill/company]. We're hiring for a [Job Title] role at [Company] that seems like a great fit for your background.<br/><br/>
                  Would you be interested in learning more? Here's the full job description: [Job URL]<br/><br/>
                  Happy to answer any questions!<br/>
                  [Your name]
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
