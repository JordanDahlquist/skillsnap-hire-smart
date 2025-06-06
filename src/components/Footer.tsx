
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © 2025 Atract. All rights reserved. 
            <span className="mx-2">•</span>
            <Link 
              to="/privacy-policy" 
              className="text-gray-500 hover:text-gray-700 underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
