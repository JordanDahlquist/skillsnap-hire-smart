
import { useAuthState } from "./useAuthState";
import { useProfile } from "./useProfile";
import { useLogger } from "./useLogger";

export const useAuth = () => {
  const { logDebug } = useLogger('useAuth');
  const { user, session, loading: authLoading, isAuthenticated, signOut } = useAuthState();
  const { profile, loading: profileLoading, refreshProfile } = useProfile(user?.id);

  const loading = authLoading || profileLoading;

  const refreshAll = async () => {
    logDebug('Refreshing all user data...');
    refreshProfile();
  };

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile: refreshAll,
    isAuthenticated
  };
};
