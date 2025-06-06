
import { Button } from "@/components/ui/button";
import { User, LogOut, BarChart3, Plus, Home, Loader2, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

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
  const {
    user,
    profile,
    signOut,
    loading
  } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  // Check if current location is the dashboard or any subdirectory of /jobs (except /jobs/public)
  const isDashboard = location.pathname === "/jobs" || 
    (location.pathname.startsWith("/jobs/") && !location.pathname.startsWith("/jobs/public"));
  
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };
  
  const getUserDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    return user?.email || 'User';
  };
  
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Main Navigation */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <img src="/lovable-uploads/fcccb8be-0469-47e0-abd3-15729af8467e.png" alt="Atract" className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">Atract</span>
            </Link>

            {/* Main Navigation Menu */}
            <NavigationMenu>
              <NavigationMenuList>
                {/* Home link - visible to all */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/" className={cn("group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50", isActive("/") && "bg-accent text-accent-foreground")}>
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Public Jobs link - only visible when not in dashboard */}
                {!isDashboard && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/jobs/public" className={cn("group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50", isActive("/jobs/public") && "bg-accent text-accent-foreground")}>
                        <Briefcase className="w-4 h-4 mr-2" />
                        Jobs
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                {/* Admin Dashboard link - only for logged in users */}
                {!loading && user && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/jobs" className={cn("group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50", isActive("/jobs") && "bg-accent text-accent-foreground")}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="hidden sm:block">
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => (
                      <div key={index} className="flex items-center">
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                          {crumb.isCurrentPage ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link to={crumb.href || "#"}>{crumb.label}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </div>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            )}
          </div>
          
          {/* Right Side Navigation */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : user ? (
              <>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-[#007af6] text-white text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {onCreateRole && (
                      <>
                        <DropdownMenuItem onClick={onCreateRole}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Job
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                {showCreateButton && onCreateRole && (
                  <Button onClick={onCreateRole} className="bg-[#007af6] hover:bg-[#0056b3] text-white">
                    Create Job
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
