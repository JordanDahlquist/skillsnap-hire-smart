
import { useMemo } from "react";
import { useAuthState } from "./useAuthState";
import { useOptimizedProfile } from "./useOptimizedProfile";
import { productionLogger } from "@/services/productionLoggerService";

export const useOptimizedAuth = () => {
  const { user, session, loading: authLoading, isAuthenticated, signOut } = useAuthState();
  
  // Start profile loading immediately when user is available, don't wait for auth to finish
  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError, 
    refetch: refreshProfile 
  } = useOptimizedProfile(user?.id);

  // Only consider auth loading, not profile loading for main loading state
  const loading = authLoading;

  // Memoize refresh function to prevent unnecessary re-renders
  const refreshAll = useMemo(() => {
    return () => {
      if (user?.id) {
        productionLogger.debug('Refreshing optimized user profile...', {
          component: 'useOptimizedAuth',
          action: 'REFRESH_PROFILE',
          metadata: { userId: user.id }
        });
        refreshProfile();
      }
    };
  }, [user?.id, refreshProfile]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    user,
    session,
    profile,
    loading, // Only auth loading, profile loads in background
    profileLoading,
    profileError,
    signOut,
    refreshProfile: refreshAll,
    isAuthenticated
  }), [
    user,
    session,
    profile,
    loading,
    profileLoading,
    profileError,
    signOut,
    refreshAll,
    isAuthenticated
  ]);
};
