
import { useState } from "react";
import { Link, Location } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

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
  const navigation = [
    { name: "Pricing", href: "/pricing" },
  ];

  const authenticatedNavigation = [
    { name: "Dashboard", href: "/jobs" },
    { name: "Scout AI", href: "/scout" },
    { name: "Inbox", href: "/inbox" },
  ];

  const currentNavigation = isAuthenticated ? authenticatedNavigation : navigation;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-8">
        {currentNavigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === item.href
                ? "text-[#007af6] border-b-2 border-[#007af6]"
                : "text-foreground/80 hover:text-[#007af6]"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden text-foreground/80"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border md:hidden backdrop-blur-xl">
          <nav className="px-4 py-2 space-y-1">
            {currentNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "text-[#007af6] bg-accent"
                    : "text-foreground/80 hover:text-[#007af6] hover:bg-accent/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};
