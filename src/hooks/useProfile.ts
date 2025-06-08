
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
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  const PROFILE_TIMEOUT = 3000; // 3 second timeout (reduced from 3000)
  const DEBOUNCE_DELAY = 100; // 100ms debounce

  const loadProfile = useCallback(async (id: string) => {
    // Clear any existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce rapid requests
    return new Promise<void>((resolve) => {
      debounceRef.current = setTimeout(async () => {
        // Prevent concurrent loads
        if (loadingRef.current) {
          console.log('Profile load already in progress, skipping...');
          resolve();
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
          resolve();
          return;
        }

        loadingRef.current = true;
        setLoading(true);
        setError(null);
        
        // Set up timeout
        timeoutRef.current = setTimeout(() => {
          console.warn('Profile loading timed out after 3 seconds');
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
            console.log('Profile loaded:', typedProfile?.full_name || 'No name');
          } else {
            setError('Profile not found');
            setProfile(null);
          }
        } catch (error) {
          // Clear timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          console.warn('Failed to load profile:', error);
          setError('Failed to load profile');
          setProfile(null);
        } finally {
          setLoading(false);
          loadingRef.current = false;
          resolve();
        }
      }, DEBOUNCE_DELAY);
    });
  }, []);

  useEffect(() => {
    if (userId && userId !== cacheRef.current?.userId) {
      loadProfile(userId);
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
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [userId, loadProfile]);

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
