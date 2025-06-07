
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AuthButtonsProps {
  showCreateButton?: boolean;
  onCreateRole?: () => void;
}

export const AuthButtons = ({ showCreateButton = true, onCreateRole }: AuthButtonsProps) => {
  return (
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
  );
};
