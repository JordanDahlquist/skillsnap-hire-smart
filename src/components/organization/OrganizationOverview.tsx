
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentOrganization, useOrganizationMembers } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { Building2, Users, Calendar, Settings, UserPlus } from "lucide-react";
import { format } from "date-fns";

interface OrganizationOverviewProps {
  onInviteClick: () => void;
}

export const OrganizationOverview = ({ onInviteClick }: OrganizationOverviewProps) => {
  const { organizationMembership } = useAuth();
  const { data: currentOrg, isLoading: orgLoading } = useCurrentOrganization();
  const { data: members = [], isLoading: membersLoading } = useOrganizationMembers(currentOrg?.id);

  const canManageTeam = organizationMembership?.role === 'owner' || organizationMembership?.role === 'admin';

  if (orgLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No organization found.</p>
        </CardContent>
      </Card>
    );
  }

  const roleColors = {
    owner: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    admin: 'bg-blue-100 text-blue-800 border-blue-200',
    editor: 'bg-green-100 text-green-800 border-green-200',
    viewer: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const roleCounts = members.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Organization Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentOrg.name}</h1>
            <p className="text-gray-600">Organization Overview</p>
          </div>
        </div>
        {canManageTeam && (
          <Button onClick={onInviteClick}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membersLoading ? '-' : members.length}</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{organizationMembership?.role || 'Member'}</div>
            <p className="text-xs text-muted-foreground">
              Organization access level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(currentOrg.created_at), 'MMM yyyy')}
            </div>
            <p className="text-xs text-muted-foreground">
              Organization established
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Team Roles</CardTitle>
          <CardDescription>Distribution of roles within your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(roleCounts).map(([role, count]) => (
              <Badge 
                key={role} 
                variant="outline" 
                className={roleColors[role as keyof typeof roleColors]}
              >
                {count} {role}{count !== 1 ? 's' : ''}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
