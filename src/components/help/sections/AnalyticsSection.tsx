
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const AnalyticsSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Reporting</CardTitle>
          <CardDescription>Understand your hiring performance and optimize your process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Accessing Analytics</h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Dashboard Analytics</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Click "Analytics" button in any job dashboard header</li>
                  <li>• View comprehensive hiring metrics and trends</li>
                  <li>• Export reports for stakeholder presentations</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Key Metrics Explained</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Application Metrics</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Total Applications:</strong> All candidates who applied</li>
                    <li>• <strong>Application Rate:</strong> Applications per day/week</li>
                    <li>• <strong>Source Breakdown:</strong> Where candidates found your job</li>
                    <li>• <strong>Quality Score:</strong> Average AI rating of applicants</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Pipeline Metrics</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Stage Distribution:</strong> Candidates in each stage</li>
                    <li>• <strong>Conversion Rates:</strong> Movement between stages</li>
                    <li>• <strong>Time in Stage:</strong> How long candidates spend in each step</li>
                    <li>• <strong>Bottlenecks:</strong> Stages where candidates get stuck</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Performance Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">What to Look For</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• <strong>High Drop-off Rates:</strong> Stages losing too many candidates</li>
                  <li>• <strong>Long Time-to-Hire:</strong> Process taking longer than industry standard</li>
                  <li>• <strong>Low Application Quality:</strong> Poor AI ratings across candidates</li>
                  <li>• <strong>Source Performance:</strong> Which channels bring best candidates</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Actionable Insights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Improving Application Quality</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Refine job descriptions to attract better matches</li>
                  <li>• Adjust required skills to be more specific</li>
                  <li>• Update salary ranges to market rates</li>
                  <li>• Improve company branding and benefits</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Optimizing Process Speed</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Reduce steps in lengthy hiring stages</li>
                  <li>• Set up automated email responses</li>
                  <li>• Use bulk actions for similar decisions</li>
                  <li>• Schedule regular review sessions</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Reporting Features</h3>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Export Options</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PDF reports for executive summaries</li>
                  <li>• CSV data for detailed analysis</li>
                  <li>• Date range customization</li>
                  <li>• Multiple job comparison reports</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Benchmarking</h3>
            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">Industry Standards</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• <strong>Time-to-Hire:</strong> 23-28 days average across industries</li>
                <li>• <strong>Application-to-Interview:</strong> 10-20% conversion rate</li>
                <li>• <strong>Interview-to-Offer:</strong> 20-40% conversion rate</li>
                <li>• <strong>Offer Acceptance:</strong> 85-95% acceptance rate</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
