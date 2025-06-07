
import { Link, useLocation } from "react-router-dom";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Home, Briefcase, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainNavigationProps {
  isAuthenticated: boolean;
  isDashboard: boolean;
}

export const MainNavigation = ({ isAuthenticated, isDashboard }: MainNavigationProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <style>{`
        @keyframes home-bounce {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(3deg); }
        }
        
        @keyframes briefcase-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-1px) rotate(-1deg); }
          75% { transform: translateX(1px) rotate(1deg); }
        }
        
        @keyframes chart-grow {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.15) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        
        .home-icon {
          transition: transform 0.2s ease-in-out;
        }
        
        .home-icon:hover {
          animation: home-bounce 0.4s ease-in-out;
        }
        
        .briefcase-icon {
          transition: transform 0.2s ease-in-out;
        }
        
        .briefcase-icon:hover {
          animation: briefcase-shake 0.3s ease-in-out;
        }
        
        .chart-icon {
          transition: transform 0.2s ease-in-out;
        }
        
        .chart-icon:hover {
          animation: chart-grow 0.35s ease-in-out;
        }
      `}</style>
      
      <NavigationMenu>
        <NavigationMenuList>
          {/* Home link - visible to all */}
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/" className={cn("group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50", isActive("/") && "bg-accent text-accent-foreground")}>
                <Home className="w-4 h-4 mr-2 home-icon" />
                Home
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Public Jobs link - only visible when not in dashboard */}
          {!isDashboard && (
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/jobs/public" className={cn("group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50", isActive("/jobs/public") && "bg-accent text-accent-foreground")}>
                  <Briefcase className="w-4 h-4 mr-2 briefcase-icon" />
                  Jobs
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}

          {/* Admin Dashboard link - only for logged in users */}
          {isAuthenticated && (
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/jobs" className={cn("group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50", isActive("/jobs") && "bg-accent text-accent-foreground")}>
                  <BarChart3 className="w-4 h-4 mr-2 chart-icon" />
                  Dashboard
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
};
