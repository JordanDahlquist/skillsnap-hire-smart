
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
        // Continue with forced reload even if Supabase signOut fails
      }
      
      logger.info('Sign out completed, forcing page reload');
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      logger.error('Error during sign out:', error);
      // Force reload even if signOut fails completely
      window.location.href = '/';
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
  }
};
