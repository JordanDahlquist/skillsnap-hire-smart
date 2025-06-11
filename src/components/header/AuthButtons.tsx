
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface AuthButtonsProps {
  showCreateButton?: boolean;
  onCreateRole?: () => void;
}

export const AuthButtons = ({ showCreateButton, onCreateRole }: AuthButtonsProps) => {
  return (
    <div className="flex items-center space-x-4">
      {showCreateButton && onCreateRole && (
        <Button
          onClick={onCreateRole}
          className="hidden sm:flex backdrop-blur-sm bg-blue-600/90 hover:bg-blue-700/90 text-white border border-blue-500/30 rounded-2xl px-6 py-3 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        asChild
        className="backdrop-blur-sm bg-white/20 hover:bg-white/30 text-slate-700 border border-white/30 rounded-2xl px-6 py-3 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
      >
        <Link to="/auth">
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Link>
      </Button>
      
      <Button 
        asChild
        className="backdrop-blur-sm bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-700/90 hover:to-indigo-700/90 text-white border border-blue-500/30 rounded-2xl px-6 py-3 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
      >
        <Link to="/signup">
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up
        </Link>
      </Button>
    </div>
  );
};
