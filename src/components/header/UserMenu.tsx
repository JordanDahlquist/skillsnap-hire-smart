
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, Plus, LogOut, Loader2, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

interface UserMenuProps {
  user: any;
  profile: any;
  profileLoading?: boolean;
  onSignOut: () => void;
  onCreateRole?: () => void;
}

export const UserMenu = ({ user, profile, profileLoading, onSignOut, onCreateRole }: UserMenuProps) => {
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map((name: string) => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };
  
  const getUserDisplayName = () => {
    // Show user email immediately if profile is loading or not available
    if (profileLoading || !profile?.full_name) {
      return user?.email?.split('@')[0] || 'User';
    }
    return profile.full_name;
  };

  const getDisplayEmail = () => {
    return user?.email || '';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-[#007af6] text-white text-xs">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium flex items-center gap-1">
              {getUserDisplayName()}
              {profileLoading && <Loader2 className="w-3 h-3 animate-spin opacity-50" />}
            </p>
            <p className="text-xs text-gray-500">{getDisplayEmail()}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/jobs" className="flex items-center w-full">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center w-full">
            <Settings className="w-4 h-4 mr-2" />
            Profile Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {onCreateRole && (
          <>
            <DropdownMenuItem onClick={onCreateRole}>
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
