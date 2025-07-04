
import { Link, useLocation } from "react-router-dom";

export const HeaderLogo = () => {
  const location = useLocation();
  
  // Check if we're on the homepage - now light themed
  const isHomepage = location.pathname === "/";
  
  return (
    <Link to="/" className="flex items-center space-x-2 group">
      <div className="w-8 h-8 flex items-center justify-center">
        <img 
          src="/lovable-uploads/fcccb8be-0469-47e0-abd3-15729af8467e.png" 
          alt="Atract" 
          className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180" 
        />
      </div>
      <span className="text-xl font-bold text-foreground transition-colors">
        Atract
      </span>
    </Link>
  );
};
