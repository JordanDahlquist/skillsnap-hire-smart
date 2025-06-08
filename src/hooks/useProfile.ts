
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
  
  // Performance optimization refs
  const loadingRef = useRef(false);
  const cacheRef = useRef<{ userId: string; profile: UserProfile; timestamp: number } | null>(null);
  const requestRef = useRef<Promise<any> | null>(null);
  
  // Optimized configuration
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  const PROFILE_TIMEOUT = 3000; // 3 seconds timeout

  const loadProfile = useCallback(async (id: string) => {
    // Check if already loading for this user
    if (loadingRef.current || !id) {
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

    // Prevent duplicate requests
    if (requestRef.current) {
      return requestRef.current;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    // Create the request promise
    requestRef.current = Promise.race([
      authService.fetchProfile(id),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), PROFILE_TIMEOUT)
      )
    ]).then((profileData) => {
      if (profileData) {
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
        setProfile(null);
        setError(null);
      }
    }).catch((error) => {
      console.warn('Failed to load profile:', error);
      setError(null); // Don't treat as critical error
      setProfile(null);
    }).finally(() => {
      setLoading(false);
      loadingRef.current = false;
      requestRef.current = null;
    });

    return requestRef.current;
  }, [CACHE_DURATION, PROFILE_TIMEOUT]);

  useEffect(() => {
    if (userId && userId !== cacheRef.current?.userId) {
      // Debounce profile loading
      const loadTimer = setTimeout(() => {
        loadProfile(userId);
      }, 100);

      return () => clearTimeout(loadTimer);
    } else if (!userId) {
      setProfile(null);
      setLoading(false);
      setError(null);
      cacheRef.current = null;
      requestRef.current = null;
    }
  }, [userId, loadProfile]);

  const refreshProfile = useCallback(() => {
    if (userId) {
      // Clear cache and reload
      cacheRef.current = null;
      requestRef.current = null;
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
