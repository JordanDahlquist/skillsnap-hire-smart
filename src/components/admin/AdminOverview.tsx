
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatformAnalytics } from "@/hooks/usePlatformAnalytics";
import { Users, Briefcase, FileText, CreditCard, TrendingUp, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminOverview = () => {
  const { analytics, isLoading, error } = usePlatformAnalytics();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Overview</h1>
          <p className="text-muted-foreground">Master admin dashboard for Atract platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error Loading Analytics</h2>
          <p className="text-muted-foreground mt-2">{error || 'Failed to load platform data'}</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Users",
      value: analytics.totalUsers,
      description: "Registered platform users",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "New Users (30d)",
      value: analytics.usersLast30Days,
      description: "Users joined last 30 days",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "New Users (7d)",
      value: analytics.usersLast7Days,
      description: "Users joined last 7 days",
      icon: Calendar,
      color: "text-purple-600"
    },
    {
      title: "Total Jobs",
      value: analytics.totalJobs,
      description: "Jobs posted on platform",
      icon: Briefcase,
      color: "text-orange-600"
    },
    {
      title: "New Jobs (30d)",
      value: analytics.jobsLast30Days,
      description: "Jobs created last 30 days",
      icon: Briefcase,
      color: "text-orange-500"
    },
    {
      title: "Total Applications",
      value: analytics.totalApplications,
      description: "Applications submitted",
      icon: FileText,
      color: "text-indigo-600"
    },
    {
      title: "New Applications (30d)",
      value: analytics.applicationsLast30Days,
      description: "Applications last 30 days",
      icon: FileText,
      color: "text-indigo-500"
    },
    {
      title: "Active Subscriptions",
      value: analytics.activeSubscriptions,
      description: "Paying customers",
      icon: CreditCard,
      color: "text-green-600"
    }
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground">Master admin dashboard for Atract platform</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Key platform indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Active Trial Users</span>
              <span className="font-bold text-amber-600">{analytics.trialSubscriptions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Conversion Rate</span>
              <span className="font-bold text-green-600">
                {analytics.totalUsers > 0 
                  ? `${((analytics.activeSubscriptions / analytics.totalUsers) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Applications per Job</span>
              <span className="font-bold text-blue-600">
                {analytics.totalJobs > 0 
                  ? (analytics.totalApplications / analytics.totalJobs).toFixed(1)
                  : '0'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Metrics</CardTitle>
            <CardDescription>Platform growth indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>User Growth (7d vs 30d)</span>
              <span className="font-bold text-green-600">
                {analytics.usersLast30Days > 0 
                  ? `${((analytics.usersLast7Days / analytics.usersLast30Days) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Job Growth (30d)</span>
              <span className="font-bold text-orange-600">
                {analytics.totalJobs > 0 
                  ? `${((analytics.jobsLast30Days / analytics.totalJobs) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Application Growth (30d)</span>
              <span className="font-bold text-indigo-600">
                {analytics.totalApplications > 0 
                  ? `${((analytics.applicationsLast30Days / analytics.totalApplications) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
