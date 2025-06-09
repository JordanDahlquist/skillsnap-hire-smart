
import { useMemo } from "react";
import { useAuthState } from "./useAuthState";
import { useProfile } from "./useProfile";
import { productionLogger } from "@/services/productionLoggerService";

export const useAuth = () => {
  const { user, session, loading: authLoading, isAuthenticated, signOut } = useAuthState();
  
  // Memoize profile loading condition to prevent unnecessary re-renders
  const shouldLoadProfile = useMemo(() => 
    !!user?.id && !authLoading, 
    [user?.id, authLoading]
  );
  
  const { profile, loading: profileLoading, error: profileError, refreshProfile } = useProfile(
    shouldLoadProfile ? user.id : undefined
  );

  // Main loading state only includes auth loading
  const loading = authLoading;

  // Memoize refresh function to prevent unnecessary re-renders
  const refreshAll = useMemo(() => {
    return () => {
      if (user?.id) {
        productionLogger.debug('Refreshing user profile...', {
          component: 'useAuth',
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
    loading,
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
