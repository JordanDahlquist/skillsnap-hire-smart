
import { useState, useEffect } from "react";
import { authService } from "@/services/authService";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  job_title: string | null;
  phone: string | null;
  profile_picture_url: string | null;
  company_website: string | null;
  default_location: string | null;
  industry: string | null;
  daily_briefing_regenerations: number | null;
  last_regeneration_date: string | null;
}

export const useProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = async (id: string) => {
    setLoading(true);
    try {
      const profileData = await authService.fetchProfile(id);
      setProfile(profileData);
      console.log('Profile loaded:', profileData?.full_name || 'No name');
    } catch (error) {
      console.warn('Failed to load profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [userId]);

  const refreshProfile = () => {
    if (userId) {
      loadProfile(userId);
    }
  };

  return {
    profile,
    loading,
    refreshProfile
  };
};
