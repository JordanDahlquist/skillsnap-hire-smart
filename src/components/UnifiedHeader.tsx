
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/hooks/useJobs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Breadcrumb {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface UnifiedHeaderProps {
  breadcrumbs?: Breadcrumb[];
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

export const UnifiedHeader = ({ 
  breadcrumbs = [], 
  showCreateButton = true, 
  onCreateClick 
}: UnifiedHeaderProps) => {
  const navigate = useNavigate();
  const { user, organizationMembership, signOut } = useAuth();
  const { refetch: refetchJobs } = useJobs();
  
  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      navigate('/jobs?create=true');
      setTimeout(() => refetchJobs(), 100);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and breadcrumbs */}
          <div className="flex items-center space-x-4">
            <Link to="/jobs" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#007af6] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">Atract</span>
            </Link>
            
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <span>/</span>
                {breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={index}>
                    {breadcrumb.href && !breadcrumb.isCurrentPage ? (
                      <Link 
                        to={breadcrumb.href}
                        className="hover:text-gray-700 transition-colors"
                      >
                        {breadcrumb.label}
                      </Link>
                    ) : (
                      <span className={breadcrumb.isCurrentPage ? "text-gray-900 font-medium" : ""}>
                        {breadcrumb.label}
                      </span>
                    )}
                    {index < breadcrumbs.length - 1 && <span>/</span>}
                  </React.Fragment>
                ))}
              </nav>
            )}
          </div>

          {/* Center - Organization info */}
          {organizationMembership && (
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4" />
              <span>{organizationMembership.organization.name}</span>
              <span className="text-gray-400">•</span>
              <span className="capitalize">{organizationMembership.role}</span>
            </div>
          )}

          {/* Right side - Actions and user menu */}
          <div className="flex items-center space-x-3">
            {showCreateButton && (
              <Button onClick={handleCreateClick} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#007af6] text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  {organizationMembership && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {organizationMembership.organization.name} • {organizationMembership.role}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
