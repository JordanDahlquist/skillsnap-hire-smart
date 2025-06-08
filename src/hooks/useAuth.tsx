
import { useAuthState } from "./useAuthState";
import { useProfile } from "./useProfile";
import { useLogger } from "./useLogger";
import { useCallback } from "react";

export const useAuth = () => {
  const { logDebug } = useLogger('useAuth');
  const { user, session, loading: authLoading, isAuthenticated, signOut } = useAuthState();
  
  // Only load profile if we have a user and auth is not loading
  const shouldLoadProfile = !!user?.id && !authLoading;
  const { profile, loading: profileLoading, error: profileError, refreshProfile } = useProfile(shouldLoadProfile ? user.id : undefined);

  // Navigation should only be blocked by auth loading, never profile loading
  const loading = authLoading;

  const refreshAll = useCallback(() => {
    if (user?.id) {
      logDebug('Refreshing user profile...');
      refreshProfile();
    }
  }, [user?.id, refreshProfile, logDebug]);

  return {
    user,
    session,
    profile,
    loading, // Only auth loading blocks navigation
    profileLoading, // Separate profile loading state
    profileError, // Expose profile errors
    signOut,
    refreshProfile: refreshAll,
    isAuthenticated
  };
};
