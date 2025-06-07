
import { Link } from "react-router-dom";

export const HeaderLogo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2 group">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
        <img 
          src="/lovable-uploads/fcccb8be-0469-47e0-abd3-15729af8467e.png" 
          alt="Atract" 
          className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180" 
        />
      </div>
      <span className="text-xl font-bold text-gray-900">Atract</span>
    </Link>
  );
};
