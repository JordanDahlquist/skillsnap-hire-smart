
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, HelpCircle, Mail } from "lucide-react";

export const TroubleshootingSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting & FAQ</CardTitle>
          <CardDescription>Common issues and their solutions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Common Issues</h3>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-900">Applications not appearing</h4>
                    <p className="text-sm text-amber-800 mt-1">New applications aren't showing up in my dashboard</p>
                  </div>
                </div>
                <div className="ml-8 space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Solutions:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Refresh the page or try hard refresh (Ctrl+F5)</li>
                    <li>• Check if the job status is set to "Active"</li>
                    <li>• Verify the application form is working on the public job page</li>
                    <li>• Check your email for application notifications</li>
                  </ul>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-900">Email sending failures</h4>
                    <p className="text-sm text-amber-800 mt-1">Bulk emails are not being delivered to candidates</p>
                  </div>
                </div>
                <div className="ml-8 space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Solutions:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check that email templates don't contain invalid variables</li>
                    <li>• Verify candidate email addresses are valid</li>
                    <li>• Check your email quota limits</li>
                    <li>• Try sending to a smaller batch first</li>
                  </ul>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-900">LinkedIn integration issues</h4>
                    <p className="text-sm text-amber-800 mt-1">LinkedIn profile import not working</p>
                  </div>
                </div>
                <div className="ml-8 space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Solutions:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Clear browser cache and try again</li>
                    <li>• Check LinkedIn permissions in your LinkedIn account</li>
                    <li>• Ensure popup blockers are disabled</li>
                    <li>• Try using an incognito/private browser window</li>
                  </ul>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-900">File upload problems</h4>
                    <p className="text-sm text-amber-800 mt-1">Resume or document uploads failing</p>
                  </div>
                </div>
                <div className="ml-8 space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Solutions:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check file size (should be under 10MB)</li>
                    <li>• Ensure file format is supported (PDF, DOC, DOCX)</li>
                    <li>• Try compressing large files</li>
                    <li>• Check your internet connection stability</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Frequently Asked Questions</h3>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">How do I delete candidates I no longer need?</h4>
                    <p className="text-sm text-gray-600">
                      Currently, candidates cannot be permanently deleted to maintain application history integrity. 
                      Instead, you can reject them and use filters to hide rejected candidates from your main view.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Can I customize the hiring stages?</h4>
                    <p className="text-sm text-gray-600">
                      Yes! Go to Profile Settings → Hiring Preferences to customize your hiring pipeline stages. 
                      You can add, remove, or rename stages to match your company's process.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">How do I export my candidate data?</h4>
                    <p className="text-sm text-gray-600">
                      In your job dashboard, select the candidates you want to export using checkboxes, 
                      then click "Export" in the bulk actions toolbar. You can export to CSV or PDF format.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">What's the difference between pausing and closing a job?</h4>
                    <p className="text-sm text-gray-600">
                      Pausing a job temporarily hides it from public view but keeps it active in your dashboard. 
                      Closing a job permanently stops accepting applications and archives the position.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Data Management</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Regularly review and rate new applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Use hiring stages to track candidate progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Export data regularly for backup purposes</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Communication</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Set up email templates for common responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Respond to applications within 48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Personalize bulk emails when possible</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Still need help?</strong> Contact our support team at support@example.com or use the chat widget 
              in the bottom right corner for immediate assistance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
