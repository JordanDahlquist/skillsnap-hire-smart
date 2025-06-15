
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const TroubleshootingSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting & Support</CardTitle>
          <CardDescription>Common issues and how to resolve them</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Common Issues</h3>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-red-500 bg-red-50">
                <h4 className="font-medium text-red-900 mb-2">Problem: No Applications Received</h4>
                <div className="text-sm text-red-800">
                  <p className="mb-2"><strong>Possible Causes:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• Job status is set to "Draft" instead of "Active"</li>
                    <li>• Job requirements are too specific or unrealistic</li>
                    <li>• Salary/budget not competitive for market</li>
                    <li>• Job not promoted on external platforms</li>
                  </ul>
                  <p className="mt-3 mb-2"><strong>Solutions:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• Verify job status is "Active" in your dashboard</li>
                    <li>• Review and broaden job requirements</li>
                    <li>• Research market rates and adjust compensation</li>
                    <li>• Share job on LinkedIn, job boards, and networks</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 border-l-4 border-amber-500 bg-amber-50">
                <h4 className="font-medium text-amber-900 mb-2">Problem: Low Quality Applications</h4>
                <div className="text-sm text-amber-800">
                  <p className="mb-2"><strong>Possible Causes:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• Job description is too vague or generic</li>
                    <li>• Required skills not clearly specified</li>
                    <li>• Job title doesn't match actual role</li>
                    <li>• Posted on inappropriate job boards</li>
                  </ul>
                  <p className="mt-3 mb-2"><strong>Solutions:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• Rewrite job description with specific requirements</li>
                    <li>• Add skills assessment to filter candidates</li>
                    <li>• Use industry-standard job titles</li>
                    <li>• Target niche job boards for your industry</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <h4 className="font-medium text-blue-900 mb-2">Problem: Email Delivery Issues</h4>
                <div className="text-sm text-blue-800">
                  <p className="mb-2"><strong>Possible Causes:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• Emails going to spam folders</li>
                    <li>• Candidate email addresses are incorrect</li>
                    <li>• Email content flagged by filters</li>
                    <li>• High volume sending without proper setup</li>
                  </ul>
                  <p className="mt-3 mb-2"><strong>Solutions:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• Use professional email templates</li>
                    <li>• Verify recipient email addresses</li>
                    <li>• Avoid spam trigger words in subject/content</li>
                    <li>• Send smaller batches over time</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Technical Support</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Before Contacting Support</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Try refreshing your browser page</li>
                  <li>• Clear browser cache and cookies</li>
                  <li>• Check your internet connection</li>
                  <li>• Try using a different browser or incognito mode</li>
                  <li>• Note the exact error message if any</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Getting Help</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Use the chat widget in the bottom-right corner</li>
                  <li>• Include screenshots of any errors</li>
                  <li>• Describe the steps you took before the issue occurred</li>
                  <li>• Mention your browser type and version</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Best Practices for Success</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Job Posting Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Write clear, specific job titles</li>
                  <li>• Include salary ranges when possible</li>
                  <li>• Highlight unique company benefits</li>
                  <li>• Use inclusive language</li>
                  <li>• Add company culture information</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Candidate Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Respond to applications within 24-48 hours</li>
                  <li>• Provide clear next steps in communications</li>
                  <li>• Keep candidates updated on timeline</li>
                  <li>• Give constructive feedback when possible</li>
                  <li>• Maintain professional tone in all interactions</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Platform Updates</h3>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Staying Informed</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Platform updates are automatically applied</li>
                <li>• New features are announced via email</li>
                <li>• Check the changelog for recent improvements</li>
                <li>• Feature requests can be submitted through support</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Emergency Contacts</h3>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Critical Issues</h4>
              <div className="text-sm text-red-800">
                <p>For urgent issues affecting active job postings or candidate communications:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Use the priority support chat option</li>
                  <li>• Mark your message as "Urgent" in the subject</li>
                  <li>• Include your account details and job ID if relevant</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
