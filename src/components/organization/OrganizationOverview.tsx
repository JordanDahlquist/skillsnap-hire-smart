
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { Building2, Users, Crown, Calendar, ExternalLink } from "lucide-react";

export const OrganizationOverview = () => {
  const { data: currentOrg, isLoading } = useCurrentOrganization();
  const { organizationMembership } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentOrg) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-amber-800">
            <Building2 className="w-5 h-5" />
            <div>
              <p className="font-medium">No Organization Found</p>
              <p className="text-sm text-amber-600">
                You don't appear to be part of an organization yet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin': return <Users className="w-4 h-4 text-blue-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'editor': return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{currentOrg.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {currentOrg.slug && (
                  <>
                    <span className="text-sm text-gray-500">/{currentOrg.slug}</span>
                    <Button variant="ghost" size="sm" className="h-auto p-0">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          {organizationMembership?.role && (
            <Badge className={getRoleColor(organizationMembership.role)}>
              {getRoleIcon(organizationMembership.role)}
              <span className="ml-1 capitalize">{organizationMembership.role}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Created {new Date(currentOrg.created_at).toLocaleDateString()}</span>
          </div>
          {organizationMembership?.role === 'owner' && (
            <div className="flex items-center gap-2 text-green-600">
              <Crown className="w-4 h-4" />
              <span>You own this organization</span>
            </div>
          )}
        </div>
        
        {organizationMembership?.role === 'owner' && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              As the owner, you have full control over this organization's settings, members, and data.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
