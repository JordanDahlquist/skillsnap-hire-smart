
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export default function AdminAnalyticsPage() {
  const monthlyData = [
    { month: 'Jan', jobs: 45, applications: 234, users: 12 },
    { month: 'Feb', jobs: 52, applications: 287, users: 18 },
    { month: 'Mar', jobs: 48, applications: 312, users: 22 },
    { month: 'Apr', jobs: 61, applications: 398, users: 28 },
    { month: 'May', jobs: 55, applications: 445, users: 31 },
    { month: 'Jun', jobs: 67, applications: 521, users: 39 },
  ];

  const statusData = [
    { name: 'Active', value: 45, color: '#10b981' },
    { name: 'Paused', value: 23, color: '#f59e0b' },
    { name: 'Closed', value: 32, color: '#6b7280' },
  ];

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive platform insights and performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <div className="text-2xl font-bold">12.5%</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg. Time to Hire</CardTitle>
              <div className="text-2xl font-bold">18 days</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">-3 days improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <div className="text-2xl font-bold">78%</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">+5% from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Platform Score</CardTitle>
              <div className="text-2xl font-bold">94/100</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Excellent performance</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Jobs, applications, and user growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="jobs" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="users" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Status Distribution</CardTitle>
              <CardDescription>Current status breakdown of all jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Volume</CardTitle>
            <CardDescription>Monthly application submissions by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
