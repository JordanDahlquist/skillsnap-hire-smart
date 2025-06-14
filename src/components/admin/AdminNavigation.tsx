
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield,
  Activity
} from "lucide-react";

export const AdminNavigation = () => {
  const location = useLocation();

  const navigationItems = [
    {
      name: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      description: "Platform dashboard and key metrics"
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      description: "User management and analytics"
    },
    {
      name: "Content",
      href: "/admin/content",
      icon: FileText,
      description: "Jobs and applications oversight"
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      description: "Advanced reports and insights"
    },
    {
      name: "Activity",
      href: "/admin/activity",
      icon: Activity,
      description: "Audit logs and system activity"
    },
    {
      name: "System",
      href: "/admin/system",
      icon: Settings,
      description: "Platform configuration and maintenance"
    }
  ];

  return (
    <nav className="w-64 bg-card border-r border-border min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Shield className="w-6 h-6 text-red-500" />
        <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
      </div>
      
      <div className="space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/admin" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs opacity-70">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
