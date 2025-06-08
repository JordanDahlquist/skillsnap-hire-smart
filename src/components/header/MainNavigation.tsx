
import { Link, useLocation } from "react-router-dom";
import { Briefcase, Mail, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInboxData } from "@/hooks/useInboxData";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/jobs",
    icon: LayoutDashboard,
  },
  {
    name: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    name: "Inbox",
    href: "/inbox",
    icon: Mail,
    showBadge: true,
  },
];

export const MainNavigation = () => {
  const location = useLocation();
  const { threads } = useInboxData();
  
  const totalUnread = threads?.reduce((sum, thread) => sum + thread.unread_count, 0) || 0;

  return (
    <nav className="hidden md:flex space-x-8">
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{item.name}</span>
            {item.showBadge && totalUnread > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {totalUnread}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
