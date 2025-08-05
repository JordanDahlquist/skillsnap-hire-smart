
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, Phone, Building, MapPin, Calendar, User, Briefcase, Target, Users, Wrench, AlertCircle } from "lucide-react";
import { AdminUser } from "@/types/admin";

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ jobsCount: 0, applicationsCount: 0 });

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;

      try {
        // Fetch user profile with all signup data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            hiring_goals,
            current_tools,
            biggest_challenges,
            hires_per_month,
            company_size,
            job_title_signup
          `)
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        // Fetch user role
        let userRole = 'user';
        try {
          const { data: roleData } = await supabase
            .rpc('get_all_user_roles');
          
          if (roleData) {
            const userRoleData = roleData.find(r => r.user_id === userId);
            if (userRoleData) {
              userRole = userRoleData.role;
            }
          }
        } catch (error) {
          console.warn('Error fetching user role:', error);
        }

        // Fetch user stats
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('user_id', userId);

        const { data: applications } = await supabase
          .from('applications')
          .select('id')
          .in('job_id', jobs?.map(j => j.id) || []);

        setUser({
          ...profile,
          role: userRole,
          hiring_goals: Array.isArray(profile.hiring_goals) ? profile.hiring_goals.filter(g => typeof g === 'string') as string[] : [],
          current_tools: Array.isArray(profile.current_tools) ? profile.current_tools.filter(t => typeof t === 'string') as string[] : [],
          biggest_challenges: Array.isArray(profile.biggest_challenges) ? profile.biggest_challenges.filter(c => typeof c === 'string') as string[] : []
        });

        setStats({
          jobsCount: jobs?.length || 0,
          applicationsCount: applications?.length || 0
        });

      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="destructive">Super Admin</Badge>;
      case 'admin':
        return <Badge variant="secondary">Admin</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin/users')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">User not found</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{user.full_name || 'No name'}</h1>
            <p className="text-muted-foreground">User Details</p>
          </div>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="pt-2">
                {getRoleBadge(user.role)}
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm text-muted-foreground">{user.company_name}</p>
              </div>
              {user.industry && (
                <div>
                  <p className="text-sm font-medium">Industry</p>
                  <p className="text-sm text-muted-foreground">{user.industry}</p>
                </div>
              )}
              {user.default_location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.default_location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-bold">{stats.jobsCount}</p>
                <p className="text-sm text-muted-foreground">Jobs Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.applicationsCount}</p>
                <p className="text-sm text-muted-foreground">Applications Received</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signup Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hiring Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Hiring Goals
              </CardTitle>
              <CardDescription>What they're looking to hire for</CardDescription>
            </CardHeader>
            <CardContent>
              {user.hiring_goals && Array.isArray(user.hiring_goals) && user.hiring_goals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.hiring_goals.map((goal: string, index: number) => (
                    <Badge key={index} variant="secondary">{goal}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hiring goals specified</p>
              )}
            </CardContent>
          </Card>

          {/* Current Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Current Tools
              </CardTitle>
              <CardDescription>Tools they're currently using</CardDescription>
            </CardHeader>
            <CardContent>
              {user.current_tools && Array.isArray(user.current_tools) && user.current_tools.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.current_tools.map((tool: string, index: number) => (
                    <Badge key={index} variant="outline">{tool}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tools specified</p>
              )}
            </CardContent>
          </Card>

          {/* Biggest Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Biggest Challenges
              </CardTitle>
              <CardDescription>Main hiring challenges they face</CardDescription>
            </CardHeader>
            <CardContent>
              {user.biggest_challenges && Array.isArray(user.biggest_challenges) && user.biggest_challenges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.biggest_challenges.map((challenge: string, index: number) => (
                    <Badge key={index} variant="destructive">{challenge}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No challenges specified</p>
              )}
            </CardContent>
          </Card>

          {/* Hiring Volume & Company Size */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Hiring Details
              </CardTitle>
              <CardDescription>Company size and hiring volume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Company Size</p>
                <p className="text-sm text-muted-foreground">
                  {user.company_size || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Hires Per Month</p>
                <p className="text-sm text-muted-foreground">
                  {user.hires_per_month || 'Not specified'}
                </p>
              </div>
              {user.job_title_signup && (
                <div>
                  <p className="text-sm font-medium">Job Title (Signup)</p>
                  <p className="text-sm text-muted-foreground">{user.job_title_signup}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Complete user profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium">Full Name</p>
                <p className="text-sm text-muted-foreground">{user.full_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm text-muted-foreground">{user.company_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Industry</p>
                <p className="text-sm text-muted-foreground">{user.industry || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Company Size</p>
                <p className="text-sm text-muted-foreground">{user.company_size || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Role</p>
                <div className="mt-1">{getRoleBadge(user.role)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
