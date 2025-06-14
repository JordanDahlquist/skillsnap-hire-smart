
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Database, 
  Server, 
  Shield, 
  Mail, 
  Zap,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function AdminSystemPage() {
  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">Platform settings and maintenance tools</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="w-4 h-4" />
                Database Status
              </CardTitle>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-lg font-semibold">Healthy</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Last backup: 2 hours ago</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Server className="w-4 h-4" />
                Server Load
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">23%</span>
                <Badge className="bg-green-100 text-green-800">Normal</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">CPU: 23% | Memory: 45%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </CardTitle>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-lg font-semibold">Secure</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">All systems protected</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>Configure global platform behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable to restrict platform access</p>
                </div>
                <Switch id="maintenance" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="registrations">New Registrations</Label>
                  <p className="text-sm text-muted-foreground">Allow new user sign-ups</p>
                </div>
                <Switch id="registrations" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics">Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">Collect usage analytics</p>
                </div>
                <Switch id="analytics" defaultChecked />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="max-jobs">Max Jobs Per User</Label>
                <Input 
                  id="max-jobs" 
                  type="number" 
                  defaultValue="10" 
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>Manage email service settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input 
                  id="smtp-host" 
                  placeholder="smtp.example.com"
                  defaultValue="smtp.mailersend.net"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input 
                  id="smtp-port" 
                  type="number" 
                  defaultValue="587"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input 
                  id="from-email" 
                  type="email" 
                  defaultValue="noreply@atract.ai"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-enabled">Email Service Enabled</Label>
                  <p className="text-sm text-muted-foreground">Enable email notifications</p>
                </div>
                <Switch id="email-enabled" defaultChecked />
              </div>

              <Button className="w-full">Test Email Configuration</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              System Actions
            </CardTitle>
            <CardDescription>Administrative tools and maintenance actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Database className="w-6 h-6" />
                <span className="font-medium">Backup Database</span>
                <span className="text-xs text-muted-foreground">Create manual backup</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Server className="w-6 h-6" />
                <span className="font-medium">Clear Cache</span>
                <span className="text-xs text-muted-foreground">Refresh system cache</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Settings className="w-6 h-6" />
                <span className="font-medium">Restart Services</span>
                <span className="text-xs text-muted-foreground">Restart background tasks</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 border-red-200 text-red-600 hover:bg-red-50">
                <AlertTriangle className="w-6 h-6" />
                <span className="font-medium">Emergency Stop</span>
                <span className="text-xs text-muted-foreground">Stop all operations</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
