import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Target,
  Calendar,
  BarChart3
} from "lucide-react";
import { HiringMetrics, PipelineData, JobPerformance } from "@/hooks/useHiringAnalytics";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface PipelineTabProps {
  analytics: {
    metrics: HiringMetrics;
    pipelineData: PipelineData;
    jobPerformanceData: JobPerformance[];
  };
}

export const PipelineTab = ({ analytics }: PipelineTabProps) => {
  const { metrics, pipelineData, jobPerformanceData } = analytics;

  const pipelineStages = [
    {
      name: "Pending Review",
      count: pipelineData.pending,
      color: "#F59E0B",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      icon: Clock,
      description: "Applications waiting for review"
    },
    {
      name: "Approved",
      count: pipelineData.approved,
      color: "#10B981",
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      icon: CheckCircle,
      description: "Applications approved for next stage"
    },
    {
      name: "Rejected",
      count: pipelineData.rejected,
      color: "#EF4444",
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      icon: XCircle,
      description: "Applications that didn't meet requirements"
    }
  ];

  const pieData = pipelineStages.map(stage => ({
    name: stage.name,
    value: stage.count,
    color: stage.color
  }));

  const COLORS = pipelineStages.map(stage => stage.color);

  // Pipeline efficiency metrics
  const totalProcessed = pipelineData.approved + pipelineData.rejected;
  const processingRate = pipelineData.totalApplications > 0 ? 
    (totalProcessed / pipelineData.totalApplications) * 100 : 0;
  
  const pendingBacklog = pipelineData.pending;
  const backlogPercentage = pipelineData.totalApplications > 0 ? 
    (pendingBacklog / pipelineData.totalApplications) * 100 : 0;

  // Job-specific pipeline analysis
  const jobPipelineData = jobPerformanceData
    .filter(job => job.applications > 0)
    .map(job => ({
      jobTitle: job.jobTitle.length > 20 ? job.jobTitle.substring(0, 20) + '...' : job.jobTitle,
      applications: job.applications,
      hiredRate: job.hiredRate,
      avgRating: job.avgRating
    }))
    .slice(0, 8);

  const pipelineInsights = [
    {
      title: "Processing Efficiency",
      value: `${processingRate.toFixed(1)}%`,
      description: `${totalProcessed} of ${pipelineData.totalApplications} applications processed`,
      status: processingRate > 75 ? 'good' : processingRate > 50 ? 'warning' : 'needs-attention',
      icon: TrendingUp
    },
    {
      title: "Pending Backlog",
      value: pendingBacklog.toString(),
      description: `${backlogPercentage.toFixed(1)}% of total applications`,
      status: backlogPercentage < 20 ? 'good' : backlogPercentage < 40 ? 'warning' : 'needs-attention',
      icon: AlertCircle
    },
    {
      title: "Hired Rate",
      value: `${metrics.hiredRate.toFixed(1)}%`,
      description: "Percentage of applications resulting in hires",
      status: metrics.hiredRate > 3 ? 'good' : metrics.hiredRate > 1.5 ? 'warning' : 'needs-attention',
      icon: Target
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'needs-attention': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pipelineStages.map((stage, index) => {
          const IconComponent = stage.icon;
          const percentage = pipelineData.totalApplications > 0 ? 
            (stage.count / pipelineData.totalApplications) * 100 : 0;

          return (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className={`p-3 rounded-lg ${stage.bgColor} mb-4`}>
                  <div className="flex items-center justify-between">
                    <IconComponent className={`w-6 h-6 ${stage.textColor}`} />
                    <Badge variant="outline" className={`${stage.textColor} border-current`}>
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stage.count}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1 text-left">
                  {stage.name}
                </div>
                <div className="text-xs text-gray-500 text-left">
                  {stage.description}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pipeline Visualization and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Distribution Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-left">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {pipelineData.totalApplications}
              </div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Efficiency Metrics */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-left">
              <Target className="w-5 h-5 text-green-600" />
              Pipeline Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineInsights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColor(insight.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5" />
                      <span className="font-semibold text-sm text-left">{insight.title}</span>
                    </div>
                    <div className="text-lg font-bold">{insight.value}</div>
                  </div>
                  <p className="text-xs text-left">{insight.description}</p>
                </div>
              );
            })}
            
            {/* Action Items */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 text-left">Recommended Actions</h4>
              <div className="space-y-1 text-sm text-blue-800">
                {pendingBacklog > 10 && (
                  <p className="text-left">• Review {pendingBacklog} pending applications to reduce backlog</p>
                )}
                {metrics.hiredRate < 2 && (
                  <p className="text-left">• Consider adjusting hiring criteria to improve hired rate</p>
                )}
                {processingRate < 60 && (
                  <p className="text-left">• Implement faster review processes to improve efficiency</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job-Specific Pipeline Performance */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-left">
            <Calendar className="w-5 h-5 text-purple-600" />
            Job Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobPipelineData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobPipelineData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="jobTitle" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#3B82F6" name="Applications" />
                  <Bar dataKey="hiredRate" fill="#10B981" name="Hired Rate %" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobPipelineData.slice(0, 6).map((job, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-1 text-left">
                      {job.jobTitle}
                    </h4>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{job.applications} apps</span>
                      <span>{job.hiredRate.toFixed(1)}% hired</span>
                    </div>
                    <div className="mt-2">
                      <Progress 
                        value={Math.min(job.hiredRate * 10, 100)} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No job performance data available yet</p>
              <p className="text-sm text-gray-400 mt-1">Start receiving applications to see pipeline analytics</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pipeline Flow Visualization */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-left">
            <ArrowRight className="w-5 h-5 text-indigo-600" />
            Application Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{pipelineData.totalApplications}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
            
            <ArrowRight className="w-6 h-6 text-gray-400" />
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{pipelineData.pending}</div>
              <div className="text-sm text-gray-600">Under Review</div>
            </div>
            
            <ArrowRight className="w-6 h-6 text-gray-400" />
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{pipelineData.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            
            <ArrowRight className="w-6 h-6 text-gray-400" />
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((metrics.hiredRate / 100) * pipelineData.totalApplications)}
              </div>
              <div className="text-sm text-gray-600">Hired</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
            <h4 className="font-semibold text-indigo-900 mb-2 text-left">Pipeline Efficiency Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-indigo-700 font-medium">Processing Rate:</span>
                <span className="ml-2 text-indigo-600">{processingRate.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-indigo-700 font-medium">Average Quality:</span>
                <span className="ml-2 text-indigo-600">{metrics.avgRating.toFixed(1)}/3.0</span>
              </div>
              <div>
                <span className="text-indigo-700 font-medium">Response Time:</span>
                <span className="ml-2 text-indigo-600">{metrics.avgTimeToResponse.toFixed(1)} days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
