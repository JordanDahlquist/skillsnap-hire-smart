
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
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <HeaderLogo />
            <MainNavigation 
              location={location}
              isAuthenticated={isAuthenticated}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            
            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <UserMenu 
                  user={user} 
                  profile={profile}
                  onSignOut={signOut}
                  onCreateRole={onCreateRole}
                />
              ) : (
                <AuthButtons />
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Trial Banner */}
      {isAuthenticated && (
        <div className="sticky top-20 z-40">
          <TrialBanner />
        </div>
      )}
    </>
  );
};
