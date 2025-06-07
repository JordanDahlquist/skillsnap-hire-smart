
import { useAuthState } from "./useAuthState";
import { useProfile } from "./useProfile";
import { useOrganizationMembership } from "./useOrganization";
import { useLogger } from "./useLogger";

export const useAuth = () => {
  const { logDebug } = useLogger('useAuth');
  const { user, session, loading: authLoading, isAuthenticated, signOut } = useAuthState();
  const { profile, loading: profileLoading, refreshProfile } = useProfile(user?.id);
  const { organizationMembership, loading: orgLoading, error: orgError, refreshOrganization } = useOrganizationMembership(user?.id);

  const dataLoading = profileLoading || orgLoading;
  const loading = authLoading;

  const refreshAll = async () => {
    logDebug('Refreshing all user data...');
    refreshProfile();
    refreshOrganization();
  };

  return {
    user,
    session,
    profile,
    organizationMembership,
    organizationError: orgError,
    loading,
    dataLoading,
    signOut,
    refreshProfile: refreshAll,
    isAuthenticated
  };
};
