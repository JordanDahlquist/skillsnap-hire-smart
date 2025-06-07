
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { HiringPreferences } from "@/components/profile/HiringPreferences";
import { EmailTemplates } from "@/components/profile/EmailTemplates";
import { OrganizationSettings } from "@/components/organization/OrganizationSettings";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Info } from "lucide-react";

const ProfileSettings = () => {
  const { user, organizationMembership, refreshProfile, loading, dataLoading } = useAuth();
  const canManageOrganization = organizationMembership?.role === 'owner' || organizationMembership?.role === 'admin';

  const breadcrumbs = [
    { label: "Dashboard", href: "/jobs" },
    { label: "Profile Settings", isCurrentPage: true },
  ];

  const handleRefreshData = async () => {
    console.log('Refreshing profile data...');
    await refreshProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007af6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader breadcrumbs={breadcrumbs} showCreateButton={false} />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="mt-2 text-gray-600">Manage your account, preferences, and organization settings.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={dataLoading}
            >
              {dataLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh Data'
              )}
            </Button>
          </div>
        </div>

        {/* Debug information */}
        {user && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1 text-sm">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Organization Status:</strong> {
                  dataLoading 
                    ? 'Loading...' 
                    : organizationMembership 
                      ? `${organizationMembership.role} of ${organizationMembership.organization.name}` 
                      : 'No organization membership found'
                }</p>
                <p><strong>Can Manage Organization:</strong> {canManageOrganization ? 'Yes' : 'No'}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {dataLoading && (
          <Alert className="mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Loading organization data...
            </AlertDescription>
          </Alert>
        )}

        {!organizationMembership && !dataLoading && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Organization data is not available. If you believe this is an error, try refreshing the data using the button above.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className={`grid w-full ${canManageOrganization ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            {canManageOrganization && (
              <TabsTrigger value="organization">Organization</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileForm />
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <AccountSettings />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <HiringPreferences />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <EmailTemplates />
          </TabsContent>

          {canManageOrganization && (
            <TabsContent value="organization" className="space-y-6">
              <OrganizationSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileSettings;
