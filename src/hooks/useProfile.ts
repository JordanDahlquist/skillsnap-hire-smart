
import { useState, useEffect, useCallback, useRef } from "react";
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
  const loadingRef = useRef(false); // Prevent concurrent loads
  const cacheRef = useRef<{ userId: string; profile: UserProfile; timestamp: number } | null>(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  const loadProfile = useCallback(async (id: string) => {
    // Prevent concurrent loads
    if (loadingRef.current) {
      console.log('Profile load already in progress, skipping...');
      return;
    }

    // Check cache first
    const now = Date.now();
    if (cacheRef.current && 
        cacheRef.current.userId === id && 
        (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      console.log('Using cached profile');
      setProfile(cacheRef.current.profile);
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    
    try {
      const profileData = await authService.fetchProfile(id);
      if (profileData) {
        setProfile(profileData);
        // Cache the result
        cacheRef.current = {
          userId: id,
          profile: profileData,
          timestamp: now
        };
        console.log('Profile loaded:', profileData?.full_name || 'No name');
      }
    } catch (error) {
      console.warn('Failed to load profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (userId && userId !== cacheRef.current?.userId) {
      loadProfile(userId);
    } else if (!userId) {
      setProfile(null);
      setLoading(false);
      cacheRef.current = null;
    }
  }, [userId, loadProfile]);

  const refreshProfile = useCallback(() => {
    if (userId) {
      // Clear cache and reload
      cacheRef.current = null;
      loadProfile(userId);
    }
  }, [userId, loadProfile]);

  return {
    profile,
    loading,
    refreshProfile
  };
};
