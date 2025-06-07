
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Settings, Menu, X } from "lucide-react";
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

interface EnhancedHeaderProps {
  breadcrumbs?: Breadcrumb[];
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

export const EnhancedHeader = ({ 
  breadcrumbs = [], 
  showCreateButton = true, 
  onCreateClick 
}: EnhancedHeaderProps) => {
  const navigate = useNavigate();
  const { user, organizationMembership, signOut } = useAuth();
  const { refetch: refetchJobs } = useJobs();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-blue-500/5' 
        : 'bg-gradient-to-r from-white/60 via-white/40 to-white/60 backdrop-blur-md'
    }`}>
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/20 to-blue-50/30 animate-pulse opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and navigation */}
          <div className="flex items-center space-x-6">
            <Link to="/jobs" className="group flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#007af6] via-[#4f46e5] to-[#7c3aed] rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#007af6] via-[#4f46e5] to-[#7c3aed] rounded-xl blur-md opacity-50 animate-pulse"></div>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent hidden sm:block">
                Atract
              </span>
            </Link>
            
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="hidden md:flex items-center space-x-2 text-sm">
                <span className="text-gray-400">/</span>
                {breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={index}>
                    {breadcrumb.href && !breadcrumb.isCurrentPage ? (
                      <Link 
                        to={breadcrumb.href}
                        className="text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:underline"
                      >
                        {breadcrumb.label}
                      </Link>
                    ) : (
                      <span className={breadcrumb.isCurrentPage ? "text-gray-900 font-medium" : "text-gray-600"}>
                        {breadcrumb.label}
                      </span>
                    )}
                    {index < breadcrumbs.length - 1 && <span className="text-gray-400">/</span>}
                  </React.Fragment>
                ))}
              </nav>
            )}
          </div>

          {/* Center - Organization info */}
          {organizationMembership && (
            <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/30">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{organizationMembership.organization.name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-xs text-gray-600 capitalize">{organizationMembership.role}</span>
            </div>
          )}

          {/* Right side - Actions and user menu */}
          <div className="flex items-center space-x-3">
            {showCreateButton && (
              <Button 
                onClick={handleCreateClick} 
                className="relative bg-gradient-to-r from-[#007af6] to-[#4f46e5] hover:from-[#0056b3] hover:to-[#3730a3] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#007af6] to-[#4f46e5] rounded-md blur-sm opacity-50 animate-pulse"></div>
                <div className="relative flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Create Job</span>
                  <span className="sm:hidden">Create</span>
                </div>
              </Button>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            {/* Desktop user menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/40 transition-all duration-200">
                    <Avatar className="h-10 w-10 ring-2 ring-white/30">
                      <AvatarFallback className="bg-gradient-to-br from-[#007af6] to-[#4f46e5] text-white font-semibold">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-white/90 backdrop-blur-xl border border-white/30" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-3">
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

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/90 backdrop-blur-xl border border-white/30 rounded-b-xl shadow-xl">
            <div className="px-4 py-3 space-y-3">
              {organizationMembership && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 py-2">
                  <Building2 className="w-4 h-4" />
                  <span>{organizationMembership.organization.name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="capitalize">{organizationMembership.role}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-[#007af6] to-[#4f46e5] text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="space-y-2">
                  <Link 
                    to="/settings" 
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors py-2 w-full text-left"
                  >
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
