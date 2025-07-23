
import { useState, useEffect, useCallback, useRef } from "react";
import { authService } from "@/services/authService";
import { productionLogger } from "@/services/productionLoggerService";
import { environment } from "@/config/environment";

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
  status: 'active' | 'inactive' | 'deleted';
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
  const PROFILE_TIMEOUT = environment.apiTimeout / 3; // Use 1/3 of API timeout

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
      productionLogger.debug('Using cached profile', {
        component: 'useProfile',
        action: 'CACHE_HIT',
        metadata: { userId: id }
      });
      setProfile(cacheRef.current.profile);
      setError(null);
      return;
    }

    // Prevent duplicate requests
    if (requestRef.current) {
      return requestRef.current;
    }

    const startTime = Date.now();
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    productionLogger.debug('Loading profile', {
      component: 'useProfile',
      action: 'LOAD_START',
      metadata: { userId: id }
    });
    
    // Create the request promise with timeout
    requestRef.current = Promise.race([
      authService.fetchProfile(id),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), PROFILE_TIMEOUT)
      )
    ]).then((profileData) => {
      const duration = Date.now() - startTime;
      
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
        
        productionLogger.info('Profile loaded successfully', {
          component: 'useProfile',
          action: 'LOAD_SUCCESS',
          metadata: { 
            userId: id,
            fullName: typedProfile?.full_name || 'No name',
            duration 
          }
        });
        
        if (environment.enablePerformanceMonitoring) {
          productionLogger.performance('loadProfile', duration, { userId: id });
        }
      } else {
        setProfile(null);
        setError(null);
        productionLogger.debug('No profile data returned', {
          component: 'useProfile',
          action: 'LOAD_EMPTY',
          metadata: { userId: id }
        });
      }
    }).catch((error) => {
      const duration = Date.now() - startTime;
      productionLogger.warn('Failed to load profile', {
        component: 'useProfile',
        action: 'LOAD_ERROR',
        metadata: { userId: id, error: error.message, duration }
      });
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
      productionLogger.debug('Refreshing profile', {
        component: 'useProfile',
        action: 'REFRESH',
        metadata: { userId }
      });
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
