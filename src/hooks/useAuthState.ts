
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { authService } from "@/services/authService";
import { useLogger } from "./useLogger";

export const useAuthState = () => {
  const { logDebug, logError, logInfo } = useLogger('useAuthState');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Performance optimization: prevent duplicate calls
  const initializingRef = useRef(false);
  const initializedRef = useRef(false);

  // Memoized sign out function
  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      logError('Sign out failed:', error);
    }
  }, [logError]);

  useEffect(() => {
    // Prevent duplicate initialization
    if (initializingRef.current || initializedRef.current) {
      return;
    }

    initializingRef.current = true;
    logDebug('Auth state hook initializing...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logInfo('Auth state change:', event, session?.user?.id || 'No session');
        
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
      logInfo('Session check timeout reached');
      setLoading(false);
      initializingRef.current = false;
      initializedRef.current = true;
    }, 1500); // Reduced timeout for better performance

    authService.getSession().then((session) => {
      clearTimeout(sessionTimeout);
      logInfo('Initial session check:', session?.user?.id || 'No session');
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      initializingRef.current = false;
      initializedRef.current = true;
    }).catch((error) => {
      clearTimeout(sessionTimeout);
      logError('Failed to get initial session:', error);
      setLoading(false);
      initializingRef.current = false;
      initializedRef.current = true;
    });

    return () => {
      clearTimeout(sessionTimeout);
      subscription.unsubscribe();
    };
  }, [logDebug, logError, logInfo]);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!session && !!user,
    signOut
  };
};
