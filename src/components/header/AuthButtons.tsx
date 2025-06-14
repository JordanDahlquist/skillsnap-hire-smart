
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const AuthButtons = () => {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        asChild
        className="text-gray-700 border-gray-300 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium px-4 py-2 h-9"
      >
        <Link to="/auth">
          Sign In
        </Link>
      </Button>
      
      <Button 
        size="sm"
        asChild
        className="bg-gradient-to-r from-[#007af6] to-[#0066d4] hover:from-[#0066d4] hover:to-[#0052a8] text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 border-0 px-4 py-2 h-9"
      >
        <Link to="/signup">
          Sign Up
        </Link>
      </Button>
    </div>
  );
};
