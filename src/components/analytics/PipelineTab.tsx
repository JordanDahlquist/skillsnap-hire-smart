
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { PipelineData } from "@/hooks/useHiringAnalytics";

interface PipelineTabProps {
  analytics: {
    pipelineData: PipelineData;
    jobPerformanceData: Array<{
      jobId: string;
      jobTitle: string;
      applications: number;
      approvalRate: number;
      avgRating: number;
    }>;
  };
}

export const PipelineTab = ({ analytics }: PipelineTabProps) => {
  const { pipelineData, jobPerformanceData } = analytics;

  const funnelData = [
    { stage: 'Applied', count: pipelineData.totalApplications, percentage: 100 },
    { stage: 'Under Review', count: pipelineData.pending, percentage: Math.round((pipelineData.pending / pipelineData.totalApplications) * 100) },
    { stage: 'Approved', count: pipelineData.approved, percentage: Math.round((pipelineData.approved / pipelineData.totalApplications) * 100) },
    { stage: 'Rejected', count: pipelineData.rejected, percentage: Math.round((pipelineData.rejected / pipelineData.totalApplications) * 100) }
  ];

  const topJobs = jobPerformanceData.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Pipeline Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-50">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{pipelineData.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-50">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{pipelineData.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{pipelineData.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-50">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {pipelineData.totalApplications > 0 
                    ? Math.round((pipelineData.approved / pipelineData.totalApplications) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium">Pending</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{pipelineData.pending}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Approved</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{pipelineData.approved}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Rejected</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{pipelineData.rejected}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Application Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <span className="text-sm text-gray-600">
                      {stage.count} ({stage.percentage}%)
                    </span>
                  </div>
                  <Progress value={stage.percentage} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Performance Stats */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Top Performing Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topJobs.map((job, index) => (
              <div key={job.jobId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{job.jobTitle}</h4>
                  <p className="text-sm text-gray-500">Job #{index + 1}</p>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Applications</p>
                    <p className="text-lg font-bold text-blue-600">{job.applications}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Approval Rate</p>
                    <p className="text-lg font-bold text-green-600">{job.approvalRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-lg font-bold text-yellow-600">{job.avgRating.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
