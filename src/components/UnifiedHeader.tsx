
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { HeaderLogo } from "./header/HeaderLogo";
import { MainNavigation } from "./header/MainNavigation";
import { AuthButtons } from "./header/AuthButtons";
import { UserMenu } from "./header/UserMenu";
import { TrialBanner } from "./subscription/TrialBanner";

interface UnifiedHeaderProps {
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    isCurrentPage?: boolean;
  }>;
  onCreateRole?: () => void;
  showCreateButton?: boolean;
}

export const UnifiedHeader = ({ breadcrumbs, onCreateRole, showCreateButton = false }: UnifiedHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <HeaderLogo />
            <MainNavigation 
              location={location}
              isAuthenticated={isAuthenticated}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <UserMenu 
                  user={user} 
                  profile={profile}
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
      
      {/* Trial Banner */}
      {isAuthenticated && (
        <div className="fixed top-16 left-0 right-0 z-40">
          <TrialBanner />
        </div>
      )}
    </>
  );
};
