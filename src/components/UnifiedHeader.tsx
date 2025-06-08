
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import { HeaderLogo } from "./header/HeaderLogo";
import { MainNavigation } from "./header/MainNavigation";
import { UserMenu } from "./header/UserMenu";
import { AuthButtons } from "./header/AuthButtons";

interface UnifiedHeaderProps {
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    isCurrentPage?: boolean;
  }>;
  onCreateRole?: () => void;
  showCreateButton?: boolean;
}

export const UnifiedHeader = ({
  breadcrumbs,
  onCreateRole,
  showCreateButton = true
}: UnifiedHeaderProps) => {
  const { user, profile, profileLoading, profileError, signOut, loading } = useAuth();
  const location = useLocation();
  
  // Check if current location is the dashboard or any subdirectory of /jobs (except /jobs/public)
  const isDashboard = location.pathname === "/jobs" || 
    (location.pathname.startsWith("/jobs/") && !location.pathname.startsWith("/jobs/public"));
  
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Main Navigation */}
          <div className="flex items-center space-x-6">
            <HeaderLogo />
            <MainNavigation 
              isAuthenticated={!!user && !loading}
              isDashboard={isDashboard}
            />
          </div>
          
          {/* Right Side Navigation */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : user ? (
              <UserMenu 
                user={user}
                profile={profile}
                profileLoading={profileLoading}
                onSignOut={signOut}
                onCreateRole={onCreateRole}
              />
            ) : (
              <AuthButtons 
                showCreateButton={showCreateButton}
                onCreateRole={onCreateRole}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
