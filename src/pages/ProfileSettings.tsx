
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { HiringPreferences } from "@/components/profile/HiringPreferences";
import { EmailTemplates } from "@/components/profile/EmailTemplates";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const ProfileSettings = () => {
  const { loading } = useAuth();

  const breadcrumbs = [
    { label: "Dashboard", href: "/jobs" },
    { label: "Profile Settings", isCurrentPage: true },
  ];

  // Only show loading screen for auth loading, not profile loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007af6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UnifiedHeader breadcrumbs={breadcrumbs} showCreateButton={false} />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account and preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
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
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ProfileSettings;
