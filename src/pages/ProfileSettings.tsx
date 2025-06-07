
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

const ProfileSettings = () => {
  const { organizationMembership, refreshProfile } = useAuth();
  const canManageOrganization = organizationMembership?.role === 'owner' || organizationMembership?.role === 'admin';

  const breadcrumbs = [
    { label: "Dashboard", href: "/jobs" },
    { label: "Profile Settings", isCurrentPage: true },
  ];

  // Debug logging to help troubleshoot
  console.log('ProfileSettings - Organization membership:', organizationMembership);
  console.log('ProfileSettings - Can manage organization:', canManageOrganization);

  const handleRefreshData = async () => {
    console.log('Refreshing profile data...');
    await refreshProfile();
  };

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
            <Button variant="outline" onClick={handleRefreshData}>
              Refresh Data
            </Button>
          </div>
        </div>

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

        {/* Debug information - remove this in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
            <h3 className="font-medium mb-2">Debug Info:</h3>
            <p>Organization Membership: {organizationMembership ? 'Found' : 'Not Found'}</p>
            <p>Role: {organizationMembership?.role || 'None'}</p>
            <p>Can Manage: {canManageOrganization ? 'Yes' : 'No'}</p>
            <p>Organization ID: {organizationMembership?.organization_id || 'None'}</p>
            <p>Organization Name: {organizationMembership?.organization?.name || 'None'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
