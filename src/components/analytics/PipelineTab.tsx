
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from "recharts";
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

  const pieData = [
    { name: 'Pending', value: pipelineData.pending, color: '#f59e0b' },
    { name: 'Approved', value: pipelineData.approved, color: '#10b981' },
    { name: 'Rejected', value: pipelineData.rejected, color: '#ef4444' }
  ];

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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
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

      {/* Job Performance Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Top Performing Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topJobs} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="jobTitle" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#3b82f6" name="Applications" />
                <Bar dataKey="approvalRate" fill="#10b981" name="Approval Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
