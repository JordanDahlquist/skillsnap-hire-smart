
import { useState, useEffect, useCallback, useMemo } from "react";
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
        const profileData = await authService.fetchProfile(user.id);

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
        return null;
      }
    },
    enabled: !!user?.id,
    ...getProfileQueryDefaults(),
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
    console.log('useConsolidatedAuth: Initializing auth hook...');
    
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('useConsolidatedAuth: Auth state change:', event, session?.user?.id || 'No session');
        
        productionLogger.info('Auth state change', {
          component: 'useConsolidatedAuth',
          action: 'AUTH_STATE_CHANGE',
          metadata: { event, userId: session?.user?.id || 'No session' }
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('useConsolidatedAuth: Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useConsolidatedAuth: Error getting session:', error);
          productionLogger.error('Failed to get initial session', {
            component: 'useConsolidatedAuth',
            action: 'INITIAL_SESSION_CHECK',
            metadata: { error }
          });
        } else {
          console.log('useConsolidatedAuth: Initial session check completed:', session?.user?.id || 'No session');
          productionLogger.info('Initial session check completed', {
            component: 'useConsolidatedAuth',
            action: 'INITIAL_SESSION_CHECK',
            metadata: { userId: session?.user?.id || 'No session' }
          });
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('useConsolidatedAuth: Failed to initialize auth:', error);
        productionLogger.error('Failed to initialize auth', {
          component: 'useConsolidatedAuth',
          action: 'INITIAL_SESSION_CHECK',
          metadata: { error }
        });
        
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
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
