
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn, Plus } from "lucide-react";

interface AuthButtonsProps {
  showCreateButton?: boolean;
  onCreateRole?: () => void;
}

export const AuthButtons = ({ showCreateButton = true, onCreateRole }: AuthButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
        <Link to="/auth">
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Link>
      </Button>
      {showCreateButton && onCreateRole && (
        <Button onClick={onCreateRole} className="bg-[#007af6] hover:bg-[#0056b3] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      )}
    </div>
  );
};
