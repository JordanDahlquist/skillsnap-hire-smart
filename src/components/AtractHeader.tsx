
import { Button } from "@/components/ui/button";
import { User, LogOut, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface AtractHeaderProps {
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    isCurrentPage?: boolean;
  }>;
  showMyJobsButton?: boolean;
}

export const AtractHeader = ({ breadcrumbs, showMyJobsButton = true }: AtractHeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/fcccb8be-0469-47e0-abd3-15729af8467e.png" 
                  alt="Atract"
                  className="w-6 h-6"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">Atract</span>
            </Link>
            
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
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  {user.email}
                </div>
                {showMyJobsButton && (
                  <Button 
                    variant="outline"
                    asChild
                    size="sm"
                  >
                    <Link to="/jobs">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      My Jobs
                    </Link>
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={signOut}
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
