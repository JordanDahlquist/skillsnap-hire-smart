
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from "lucide-react";
import { useState } from "react";

export default function AdminActivityPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock audit log data
  const auditLogs = [
    {
      id: 1,
      timestamp: "2024-06-14 10:30:15",
      user: "admin@company.com",
      action: "user.created",
      target: "john@example.com",
      details: "New user registration",
      status: "success"
    },
    {
      id: 2,
      timestamp: "2024-06-14 10:25:32",
      user: "hr@company.com",
      action: "job.published",
      target: "Senior Developer",
      details: "Job posting made public",
      status: "success"
    },
    {
      id: 3,
      timestamp: "2024-06-14 10:20:48",
      user: "admin@company.com",
      action: "user.deleted",
      target: "temp@example.com",
      details: "Spam account removal",
      status: "warning"
    },
    {
      id: 4,
      timestamp: "2024-06-14 10:15:12",
      user: "system",
      action: "backup.completed",
      target: "database",
      details: "Scheduled backup finished",
      status: "success"
    },
    {
      id: 5,
      timestamp: "2024-06-14 10:10:05",
      user: "recruiter@company.com",
      action: "application.reviewed",
      target: "App #1234",
      details: "Application status updated",
      status: "info"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Activity</h1>
          <p className="text-muted-foreground">Audit logs and platform activity monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
              <div className="text-2xl font-bold">247</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">+15% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <div className="text-2xl font-bold">89</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <div className="text-2xl font-bold">98.9%</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Uptime this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <div className="text-2xl font-bold">3</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Detailed system activity and user actions</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{log.action}</code>
                    </TableCell>
                    <TableCell>{log.target}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
