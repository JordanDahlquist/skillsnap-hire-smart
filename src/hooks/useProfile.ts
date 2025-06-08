
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
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const cacheRef = useRef<{ userId: string; profile: UserProfile; timestamp: number } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Simplified configuration - less aggressive caching and timeouts
  const CACHE_DURATION = 2 * 60 * 1000; // Reduced to 2 minutes
  const PROFILE_TIMEOUT = 2000; // Reduced to 2 seconds
  const RETRY_DELAY = 500; // 500ms retry delay

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
      setError(null);
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    // Set up timeout for reliability
    timeoutRef.current = setTimeout(() => {
      console.warn('Profile loading timed out after 2 seconds');
      setError('Profile loading timed out');
      setLoading(false);
      loadingRef.current = false;
    }, PROFILE_TIMEOUT);

    try {
      const profileData = await authService.fetchProfile(id);
      
      // Clear timeout if request completes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (profileData) {
        // Type assertion since we know the structure from authService
        const typedProfile = profileData as UserProfile;
        setProfile(typedProfile);
        setError(null);
        // Cache the result
        cacheRef.current = {
          userId: id,
          profile: typedProfile,
          timestamp: now
        };
        console.log('Profile loaded successfully:', typedProfile?.full_name || 'No name');
      } else {
        console.log('No profile found for user');
        setError(null); // Don't treat missing profile as error
        setProfile(null);
      }
    } catch (error) {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      console.warn('Failed to load profile:', error);
      // Don't treat profile loading errors as critical
      setError(null);
      setProfile(null);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [CACHE_DURATION, PROFILE_TIMEOUT]);

  useEffect(() => {
    if (userId && userId !== cacheRef.current?.userId) {
      // Small delay to prevent race conditions
      const delayTimer = setTimeout(() => {
        loadProfile(userId);
      }, RETRY_DELAY);

      return () => clearTimeout(delayTimer);
    } else if (!userId) {
      setProfile(null);
      setLoading(false);
      setError(null);
      cacheRef.current = null;
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [userId, loadProfile, RETRY_DELAY]);

  const refreshProfile = useCallback(() => {
    if (userId) {
      // Clear cache and reload
      cacheRef.current = null;
      setError(null);
      loadProfile(userId);
    }
  }, [userId, loadProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile
  };
};
