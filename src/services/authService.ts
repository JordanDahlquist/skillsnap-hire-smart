
import { supabase } from "@/integrations/supabase/client";
import { logger } from "./loggerService";

export const authService = {
  async signOut() {
    try {
      logger.info('Starting sign out process...');
      
      // Clear local storage and session storage first
      localStorage.clear();
      sessionStorage.clear();
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Supabase sign out error:', error);
        // Continue with forced redirect even if Supabase signOut fails
      }
      
      logger.info('Sign out completed, redirecting to home page');
      
      // Clear any navigation state that might interfere
      if (typeof window !== 'undefined') {
        // Use history.replaceState to clear navigation history
        window.history.replaceState(null, '', '/');
        
        // Small delay to ensure clean state before redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
    } catch (error) {
      logger.error('Error during sign out:', error);
      // Force redirect to home page even if signOut fails completely
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logger.error('Error getting session:', error);
        return null;
      }
      return session;
    } catch (error) {
      logger.error('Failed to get session:', error);
      return null;
    }
  },

  async fetchProfile(userId: string) {
    logger.debug('Fetching profile for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

      if (error) {
        logger.error('Profile fetch error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Profile fetch failed:', error);
      throw error;
    }
  },

  async signInWithStatusCheck(email: string, password: string) {
    try {
      // Attempt normal authentication
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check if user exists and their status
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('status')
          .eq('email', email)
          .maybeSingle();

        if (userProfile) {
          if (userProfile.status === 'inactive') {
            throw new Error('Your account is inactive. Please contact support.');
          }
          if (userProfile.status === 'deleted') {
            throw new Error('Your account has been deleted. Please contact support.');
          }
        }

        // Return original error if not status-related
        throw error;
      }

      return { error: null };
    } catch (error) {
      logger.error('Sign in with status check failed:', error);
      throw error;
    }
  }
};
