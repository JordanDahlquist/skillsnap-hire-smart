import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatformAnalytics } from "@/hooks/usePlatformAnalytics";
import { Users, FileText, TrendingUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminOverview = () => {
  const { analytics, isLoading, error } = usePlatformAnalytics();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Overview</h1>
          <p className="text-muted-foreground">Platform insights and key metrics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-left py-8 text-muted-foreground">
          <p>Error loading analytics: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">Platform insights and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Total Users
            </CardTitle>
            <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              +{analytics?.usersLast30Days || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              Total Jobs
            </CardTitle>
            <div className="text-2xl font-bold">{analytics?.totalJobs || 0}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              +{analytics?.jobsLast30Days || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Applications
            </CardTitle>
            <div className="text-2xl font-bold">{analytics?.totalApplications || 0}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              +{analytics?.applicationsLast30Days || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Active Users
            </CardTitle>
            <div className="text-2xl font-bold">{analytics?.usersLast7Days || 0}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Overview</CardTitle>
            <CardDescription>Current subscription status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Subscriptions</span>
                <span className="text-2xl font-bold text-green-600">
                  {analytics?.activeSubscriptions || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Trial Users</span>
                <span className="text-2xl font-bold text-blue-600">
                  {analytics?.trialSubscriptions || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>System status and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">System Status</span>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Database</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
