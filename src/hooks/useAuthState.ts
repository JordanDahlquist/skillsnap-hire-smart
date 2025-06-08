
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { authService } from "@/services/authService";
import { useLogger } from "./useLogger";

export const useAuthState = () => {
  const { logDebug, logError, logInfo } = useLogger('useAuthState');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logDebug('Auth state hook initializing...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logInfo('Auth state change:', event, session?.user?.id || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Always set loading to false after auth state change
        setLoading(false);
      }
    );

    // Check for existing session
    authService.getSession().then((session) => {
      logInfo('Initial session check:', session?.user?.id || 'No session');
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      logError('Failed to get initial session:', error);
      setLoading(false);
    });

    // Reduced failsafe timeout for auth loading
    const timeout = setTimeout(() => {
      logInfo('Auth loading timeout reached, setting loading to false');
      setLoading(false);
    }, 2000); // Reduced from 3000 to 2000ms

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [logDebug, logError, logInfo]);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!session && !!user,
    signOut: authService.signOut
  };
};
