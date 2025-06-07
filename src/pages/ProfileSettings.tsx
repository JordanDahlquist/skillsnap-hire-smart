
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { HiringPreferences } from "@/components/profile/HiringPreferences";
import { EmailTemplates } from "@/components/profile/EmailTemplates";
import { OrganizationSettings } from "@/components/organization/OrganizationSettings";
import { OrganizationOverview } from "@/components/organization/OrganizationOverview";
import { EnhancedTeamManagement } from "@/components/organization/EnhancedTeamManagement";
import { OrganizationOnboarding } from "@/components/organization/OrganizationOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";

const ProfileSettings = () => {
  const { user, organizationMembership, refreshProfile, loading, dataLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [inviteFormOpen, setInviteFormOpen] = useState(false);
  
  const canManageOrganization = organizationMembership?.role === 'owner' || organizationMembership?.role === 'admin';

  const breadcrumbs = [
    { label: "Dashboard", href: "/jobs" },
    { label: "Profile Settings", isCurrentPage: true },
  ];

  // Check if we need to show onboarding
  useEffect(() => {
    if (!dataLoading && organizationMembership?.organization?.name === 'My Organization') {
      setShowOnboarding(true);
    }
  }, [organizationMembership, dataLoading]);

  const handleRefreshData = async () => {
    console.log('Refreshing profile data...');
    await refreshProfile();
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    refreshProfile();
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
    <>
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader breadcrumbs={breadcrumbs} showCreateButton={false} />
        
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-2 text-gray-600">
                  Manage your account, preferences, and organization settings.
                  {organizationMembership && (
                    <span className="block text-sm text-blue-600 mt-1">
                      {organizationMembership.organization.name} • {organizationMembership.role}
                    </span>
                  )}
                </p>
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

          {/* Show loading state while organization data is being fetched */}
          {dataLoading && (
            <Alert className="mb-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Loading organization data...
              </AlertDescription>
            </Alert>
          )}

          {/* Show error only if data loading is complete and no organization is found */}
          {!organizationMembership && !dataLoading && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Unable to load organization information. You may need to be invited to an organization or create one. 
                Try refreshing the data using the button above.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className={`grid w-full ${canManageOrganization ? 'grid-cols-6' : 'grid-cols-4'}`}>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              {canManageOrganization && (
                <>
                  <TabsTrigger value="organization">Organization</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                </>
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
              <>
                <TabsContent value="organization" className="space-y-6">
                  <OrganizationOverview onInviteClick={() => setInviteFormOpen(true)} />
                  <OrganizationSettings />
                </TabsContent>

                <TabsContent value="team" className="space-y-6">
                  <EnhancedTeamManagement />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OrganizationOnboarding 
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
};

export default ProfileSettings;
