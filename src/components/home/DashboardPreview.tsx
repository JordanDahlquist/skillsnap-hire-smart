import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Briefcase, Users, TrendingUp, Clock, CheckCircle, Calendar } from "lucide-react";

export const DashboardPreview = () => {
  return (
    <section className="bg-muted/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            See Your Hiring Dashboard in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get a complete overview of your recruitment pipeline with real-time insights and AI-powered recommendations.
          </p>
        </div>
        
        {/* Dashboard Mockup */}
        <div className="bg-white rounded-lg shadow-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-primary/5 px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Good morning, Sarah!</h3>
                <p className="text-muted-foreground">Here's what's happening with your hiring today</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Create New Job
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">12</p>
                      <p className="text-sm text-muted-foreground">Active Jobs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-success/10 p-2 rounded-lg">
                      <Users className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">347</p>
                      <p className="text-sm text-muted-foreground">Total Applicants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-warning/10 p-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">89%</p>
                      <p className="text-sm text-muted-foreground">AI Match Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-info/10 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">5.2</p>
                      <p className="text-sm text-muted-foreground">Avg Days to Hire</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <h4 className="text-lg font-semibold text-foreground">Recent Job Posts</h4>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Senior Frontend Developer</p>
                      <p className="text-sm text-muted-foreground">Posted 2 hours ago</p>
                    </div>
                    <Badge className="bg-success/10 text-success hover:bg-success/20">23 applicants</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Product Manager</p>
                      <p className="text-sm text-muted-foreground">Posted 1 day ago</p>
                    </div>
                    <Badge className="bg-warning/10 text-warning hover:bg-warning/20">12 applicants</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">UX Designer</p>
                      <p className="text-sm text-muted-foreground">Posted 3 days ago</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">8 applicants</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <h4 className="text-lg font-semibold text-foreground">AI Recommendations</h4>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Top candidate identified</p>
                      <p className="text-sm text-muted-foreground">Alex Chen shows 96% match for Frontend Developer role</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-info mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Schedule interviews</p>
                      <p className="text-sm text-muted-foreground">3 candidates ready for Product Manager interviews</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Optimize job posting</p>
                      <p className="text-sm text-muted-foreground">Update UX Designer requirements for better matches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};