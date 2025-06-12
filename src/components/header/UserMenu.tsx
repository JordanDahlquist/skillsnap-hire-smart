
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, Plus, LogOut, Loader2, LayoutDashboard, Sun, Moon, Circle, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import { useThemeContext } from "@/contexts/ThemeContext";

interface UserMenuProps {
  user: any;
  profile: any;
  profileLoading?: boolean;
  onSignOut: () => void;
  onCreateRole?: () => void;
}

export const UserMenu = ({ user, profile, profileLoading, onSignOut, onCreateRole }: UserMenuProps) => {
  const { theme, setTheme } = useThemeContext();

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

  const getThemeIcon = (themeOption: string) => {
    switch (themeOption) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'white':
        return <Circle className="w-4 h-4" />;
      case 'black':
        return <Circle className="w-4 h-4 fill-current" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const getThemeLabel = (themeOption: string) => {
    switch (themeOption) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'white':
        return 'White';
      case 'black':
        return 'Black';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  const themeOptions = ['light', 'dark', 'white', 'black', 'system'];

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
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {getThemeIcon(theme)}
            <span className="ml-2">Theme: {getThemeLabel(theme)}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {themeOptions.map((themeOption) => (
              <DropdownMenuItem
                key={themeOption}
                onClick={() => setTheme(themeOption as any)}
                className={`flex items-center ${theme === themeOption ? 'bg-accent' : ''}`}
              >
                {getThemeIcon(themeOption)}
                <span className="ml-2">{getThemeLabel(themeOption)}</span>
                {theme === themeOption && (
                  <span className="ml-auto text-xs opacity-60">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
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
