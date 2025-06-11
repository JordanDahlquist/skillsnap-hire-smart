
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
          className="hidden sm:flex"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        asChild
      >
        <Link to="/auth">
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Link>
      </Button>
      
      <Button 
        asChild
      >
        <Link to="/signup">
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up
        </Link>
      </Button>
    </div>
  );
};
