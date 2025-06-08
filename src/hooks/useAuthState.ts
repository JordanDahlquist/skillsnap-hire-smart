
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { authService } from "@/services/authService";
import { productionLogger } from "@/services/productionLoggerService";
import { environment } from "@/config/environment";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Performance optimization: prevent duplicate calls
  const initializingRef = useRef(false);
  const initializedRef = useRef(false);

  // Memoized sign out function
  const signOut = useCallback(async () => {
    const startTime = Date.now();
    try {
      await authService.signOut();
      setSession(null);
      setUser(null);
      
      productionLogger.info('User signed out successfully', {
        component: 'useAuthState',
        action: 'SIGN_OUT'
      });
    } catch (error) {
      productionLogger.error('Sign out failed', {
        component: 'useAuthState',
        action: 'SIGN_OUT',
        metadata: { error }
      });
    } finally {
      if (environment.enablePerformanceMonitoring) {
        productionLogger.performance('signOut', Date.now() - startTime);
      }
    }
  }, []);

  useEffect(() => {
    // Prevent duplicate initialization
    if (initializingRef.current || initializedRef.current) {
      return;
    }

    initializingRef.current = true;
    productionLogger.debug('Auth state hook initializing...', {
      component: 'useAuthState',
      action: 'INIT'
    });
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        productionLogger.info('Auth state change', {
          component: 'useAuthState',
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
        component: 'useAuthState',
        action: 'SESSION_TIMEOUT'
      });
      setLoading(false);
      initializingRef.current = false;
      initializedRef.current = true;
    }, environment.apiTimeout / 2); // Use half the API timeout

    authService.getSession().then((session) => {
      clearTimeout(sessionTimeout);
      productionLogger.info('Initial session check completed', {
        component: 'useAuthState',
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
        component: 'useAuthState',
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

  return {
    user,
    session,
    loading,
    isAuthenticated: !!session && !!user,
    signOut
  };
};
