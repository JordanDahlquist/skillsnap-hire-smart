
import { useAuthState } from "./useAuthState";
import { useProfile } from "./useProfile";
import { useOrganizationMembership } from "./useOrganization";

export const useAuth = () => {
  const { user, session, loading: authLoading, isAuthenticated, signOut } = useAuthState();
  const { profile, loading: profileLoading, refreshProfile } = useProfile(user?.id);
  const { organizationMembership, loading: orgLoading, refreshOrganization } = useOrganizationMembership(user?.id);

  const dataLoading = profileLoading || orgLoading;
  const loading = authLoading;

  const refreshAll = async () => {
    console.log('Refreshing all user data...');
    refreshProfile();
    refreshOrganization();
  };

  return {
    user,
    session,
    profile,
    organizationMembership,
    loading,
    dataLoading,
    signOut,
    refreshProfile: refreshAll,
    isAuthenticated
  };
};
