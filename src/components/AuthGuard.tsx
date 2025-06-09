
import { useConsolidatedAuth } from "@/hooks/useConsolidatedAuth";
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const { isAuthenticated, loading } = useConsolidatedAuth();
  const location = useLocation();

  // Only show loading for auth, not profile
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007af6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    // Store the current location for redirect after login
    const redirectUrl = location.pathname + location.search;
    if (redirectUrl !== '/auth') {
      sessionStorage.setItem('auth_redirect_url', redirectUrl);
    }
    return <Navigate to="/auth" replace />;
  }

  // FIXED: Remove the automatic redirect for authenticated users on home page
  // Let authenticated users access any page they want to visit
  if (!requireAuth && isAuthenticated && location.pathname === '/auth') {
    // Only redirect away from auth page if user is already authenticated
    const storedRedirectUrl = sessionStorage.getItem('auth_redirect_url');
    if (storedRedirectUrl) {
      sessionStorage.removeItem('auth_redirect_url');
      return <Navigate to={storedRedirectUrl} replace />;
    }
    return <Navigate to="/jobs" replace />;
  }

  return <>{children}</>;
};
