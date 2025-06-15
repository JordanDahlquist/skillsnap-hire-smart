
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const EmailTemplatesSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Templates & Communication</CardTitle>
          <CardDescription>Master bulk emails and candidate communication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Setting Up Email Templates</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Accessing Template Settings</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Go to Profile Settings → Templates tab</li>
                  <li>• Create templates for common scenarios</li>
                  <li>• Use variables like {{candidateName}} and {{jobTitle}}</li>
                  <li>• Save multiple templates for different situations</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Sending Bulk Emails</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">From Applications Dashboard</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Select multiple candidates using checkboxes</li>
                  <li>• Click "Send Email" in the bulk actions toolbar</li>
                  <li>• Choose from your saved templates or write custom message</li>
                  <li>• Preview emails before sending</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">From Candidate Detail</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Click "Email" button in candidate header</li>
                  <li>• Send personalized one-on-one messages</li>
                  <li>• Templates auto-fill with candidate details</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Template Variables</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Candidate Variables</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{{candidateName}}</Badge>
                    <span className="text-sm text-gray-600">Candidate's full name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{{candidateEmail}}</Badge>
                    <span className="text-sm text-gray-600">Candidate's email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{{candidateFirstName}}</Badge>
                    <span className="text-sm text-gray-600">First name only</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Job Variables</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{{jobTitle}}</Badge>
                    <span className="text-sm text-gray-600">Job position title</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{{companyName}}</Badge>
                    <span className="text-sm text-gray-600">Your company name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{{jobUrl}}</Badge>
                    <span className="text-sm text-gray-600">Link to job posting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Common Email Templates</h3>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Application Acknowledgment</h4>
                <div className="text-sm text-gray-700 font-mono bg-gray-50 p-3 rounded">
                  Hi {{candidateFirstName}},<br/><br/>
                  Thank you for applying to the {{jobTitle}} position at {{companyName}}. We've received your application and will review it carefully.<br/><br/>
                  We'll be in touch within the next few days with next steps.<br/><br/>
                  Best regards,<br/>
                  The {{companyName}} Team
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Interview Invitation</h4>
                <div className="text-sm text-gray-700 font-mono bg-gray-50 p-3 rounded">
                  Hi {{candidateFirstName}},<br/><br/>
                  We're impressed with your background and would like to invite you for an interview for the {{jobTitle}} position.<br/><br/>
                  Please reply with your availability for the coming week, and we'll schedule a time that works for both of us.<br/><br/>
                  Looking forward to speaking with you!<br/>
                  [Your name]
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Rejection (Respectful)</h4>
                <div className="text-sm text-gray-700 font-mono bg-gray-50 p-3 rounded">
                  Hi {{candidateFirstName}},<br/><br/>
                  Thank you for your interest in the {{jobTitle}} position at {{companyName}} and for the time you invested in the application process.<br/><br/>
                  After careful consideration, we've decided to move forward with other candidates whose experience more closely matches our current needs.<br/><br/>
                  We'll keep your information on file for future opportunities that might be a better fit.<br/><br/>
                  Best of luck in your job search!<br/>
                  The {{companyName}} Team
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
