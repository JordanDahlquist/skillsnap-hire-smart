
import { useState } from "react";
import { Link, Location } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { useAdminRole } from "@/hooks/useAdminRole";

interface MainNavigationProps {
  location: Location;
  isAuthenticated: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const MainNavigation = ({ 
  location, 
  isAuthenticated, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: MainNavigationProps) => {
  const { isSuperAdmin, isLoading } = useAdminRole();

  const navigation = [
    { name: "Pricing", href: "/pricing" },
  ];

  const authenticatedNavigation = [
    { name: "Dashboard", href: "/jobs" },
    { name: "Scout AI", href: "/scout" },
    { name: "Inbox", href: "/inbox" },
  ];

  // Add admin panel for super admins (only when not loading and confirmed as super admin)
  if (isAuthenticated && !isLoading && isSuperAdmin) {
    authenticatedNavigation.push({
      name: "Admin Panel",
      href: "/admin"
    });
  }

  const currentNavigation = isAuthenticated ? authenticatedNavigation : navigation;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-8">
        {currentNavigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                ? "text-[#007af6] border-b-2 border-[#007af6]"
                : "text-gray-700 hover:text-[#007af6]"
            }`}
          >
            {item.name === "Admin Panel" && <Shield className="w-4 h-4 text-red-500" />}
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 md:hidden backdrop-blur-xl shadow-lg">
          <nav className="px-4 py-2 space-y-1">
            {currentNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 rounded-md ${
                  location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                    ? "text-[#007af6] bg-blue-50"
                    : "text-gray-700 hover:text-[#007af6] hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name === "Admin Panel" && <Shield className="w-4 h-4 text-red-500" />}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};
