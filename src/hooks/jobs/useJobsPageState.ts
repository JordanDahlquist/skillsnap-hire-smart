
import { useState, useCallback } from "react";

interface Profile {
  full_name?: string;
}

interface User {
  email?: string;
}

export const useJobsPageState = (profile: Profile | null, user: User | null) => {
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);

  const getUserDisplayName = useCallback(() => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'there';
  }, [profile?.full_name, user?.email]);

  const handleCreateJob = useCallback(() => {
    setIsCreatePanelOpen(true);
  }, []);

  return {
    isCreatePanelOpen,
    setIsCreatePanelOpen,
    getUserDisplayName,
    handleCreateJob
  };
};
