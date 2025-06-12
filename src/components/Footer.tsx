
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-transparent border-t border-border py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Atract. All rights reserved. 
            <span className="mx-2">•</span>
            <Link 
              to="/privacy" 
              className="text-muted-foreground hover:text-foreground underline"
            >
              Privacy Policy
            </Link>
            <span className="mx-2">•</span>
            <Link 
              to="/terms-and-conditions" 
              className="text-muted-foreground hover:text-foreground underline"
            >
              Terms of Service
            </Link>
            <span className="mx-2">•</span>
            <Link 
              to="/refund-policy" 
              className="text-muted-foreground hover:text-foreground underline"
            >
              Refund Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
