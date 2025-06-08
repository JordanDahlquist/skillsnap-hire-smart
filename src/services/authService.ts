
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "./apiClient";
import { logger } from "./loggerService";

export const authService = {
  async signOut() {
    try {
      // Clear local storage first
      localStorage.clear();
      sessionStorage.clear();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      logger.error('Error signing out:', error);
      // Force reload even if signOut fails
      window.location.href = '/';
    }
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async fetchProfile(userId: string) {
    return apiClient.query(async () => {
      logger.debug('Fetching profile for user:', userId);
      
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
    });
  }
};
