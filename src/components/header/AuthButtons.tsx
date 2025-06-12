
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export const AuthButtons = () => {
  return (
    <div className="flex items-center space-x-3">
      <Button 
        variant="ghost" 
        asChild
        className="text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-all duration-200 font-medium"
      >
        <Link to="/auth" className="flex items-center gap-2">
          <LogIn className="w-4 h-4" />
          Sign In
        </Link>
      </Button>
      
      <Button 
        asChild
        className="bg-gradient-to-r from-[#007af6] to-[#0066d4] hover:from-[#0066d4] hover:to-[#0052a8] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 border-0"
      >
        <Link to="/signup" className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Sign Up
        </Link>
      </Button>
    </div>
  );
};
