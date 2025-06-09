
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { authService } from "@/services/authService";
import { productionLogger } from "@/services/productionLoggerService";
import { environment } from "@/config/environment";
import { getProfileQueryDefaults } from "@/config/query/queryDefaults";

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
  unique_email: string | null;
}

export const useConsolidatedAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Performance optimization: prevent duplicate calls
  const initializingRef = useRef(false);
  const initializedRef = useRef(false);

  // Profile query - only runs when user is available
  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError, 
    refetch: refreshProfile 
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const startTime = Date.now();
      productionLogger.debug('Loading consolidated profile', {
        component: 'useConsolidatedAuth',
        action: 'LOAD_START',
        metadata: { userId: user.id }
      });

      try {
        // Use Promise.race for timeout handling
        const profileData = await Promise.race([
          authService.fetchProfile(user.id),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Profile loading timeout')), environment.profileTimeout)
          )
        ]);

        const duration = Date.now() - startTime;
        
        if (profileData) {
          productionLogger.info('Consolidated profile loaded successfully', {
            component: 'useConsolidatedAuth',
            action: 'LOAD_SUCCESS',
            metadata: { 
              userId: user.id,
              fullName: (profileData as UserProfile)?.full_name || 'No name',
              duration 
            }
          });
          
          if (environment.enablePerformanceMonitoring) {
            productionLogger.performance('loadConsolidatedProfile', duration, { userId: user.id });
          }
        }

        return profileData as UserProfile | null;
      } catch (error) {
        const duration = Date.now() - startTime;
        productionLogger.warn('Consolidated profile loading failed, continuing without profile', {
          component: 'useConsolidatedAuth',
          action: 'LOAD_ERROR',
          metadata: { userId: user.id, error: (error as Error).message, duration }
        });
        // Return null instead of throwing to prevent auth chain breaks
        return null;
      }
    },
    enabled: !!user?.id,
    ...getProfileQueryDefaults(),
    // Prevent refetching on every mount
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Memoized sign out function
  const signOut = useCallback(async () => {
    const startTime = Date.now();
    try {
      await authService.signOut();
      setSession(null);
      setUser(null);
      
      productionLogger.info('User signed out successfully', {
        component: 'useConsolidatedAuth',
        action: 'SIGN_OUT'
      });
    } catch (error) {
      productionLogger.error('Sign out failed', {
        component: 'useConsolidatedAuth',
        action: 'SIGN_OUT',
        metadata: { error }
      });
    } finally {
      if (environment.enablePerformanceMonitoring) {
        productionLogger.performance('signOut', Date.now() - startTime);
      }
    }
  }, []);

  // Memoized refresh function
  const refreshAll = useMemo(() => {
    return () => {
      if (user?.id) {
        productionLogger.debug('Refreshing consolidated user profile...', {
          component: 'useConsolidatedAuth',
          action: 'REFRESH_PROFILE',
          metadata: { userId: user.id }
        });
        refreshProfile();
      }
    };
  }, [user?.id, refreshProfile]);

  useEffect(() => {
    // Prevent duplicate initialization
    if (initializingRef.current || initializedRef.current) {
      return;
    }

    initializingRef.current = true;
    productionLogger.debug('Consolidated auth hook initializing...', {
      component: 'useConsolidatedAuth',
      action: 'INIT'
    });
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        productionLogger.info('Auth state change', {
          component: 'useConsolidatedAuth',
          action: 'AUTH_STATE_CHANGE',
          metadata: { event, userId: session?.user?.id || 'No session' }
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Set loading to false after first auth state change
        if (initializingRef.current) {
          setLoading(false);
          initializingRef.current = false;
          initializedRef.current = true;
        }
      }
    );

    // Check for existing session with timeout
    const sessionTimeout = setTimeout(() => {
      productionLogger.warn('Session check timeout reached', {
        component: 'useConsolidatedAuth',
        action: 'SESSION_TIMEOUT'
      });
      setLoading(false);
      initializingRef.current = false;
      initializedRef.current = true;
    }, environment.apiTimeout / 2);

    authService.getSession().then((session) => {
      clearTimeout(sessionTimeout);
      productionLogger.info('Initial session check completed', {
        component: 'useConsolidatedAuth',
        action: 'INITIAL_SESSION_CHECK',
        metadata: { userId: session?.user?.id || 'No session' }
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      initializingRef.current = false;
      initializedRef.current = true;
    }).catch((error) => {
      clearTimeout(sessionTimeout);
      productionLogger.error('Failed to get initial session', {
        component: 'useConsolidatedAuth',
        action: 'INITIAL_SESSION_CHECK',
        metadata: { error }
      });
      setLoading(false);
      initializingRef.current = false;
      initializedRef.current = true;
    });

    return () => {
      clearTimeout(sessionTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    user,
    session,
    profile,
    loading,
    profileLoading,
    profileError,
    signOut,
    refreshProfile: refreshAll,
    isAuthenticated: !!session && !!user
  }), [
    user,
    session,
    profile,
    loading,
    profileLoading,
    profileError,
    signOut,
    refreshAll
  ]);
};
