
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "./apiClient";

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
      console.error('Error signing out:', error);
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
      console.log('Fetching profile for user:', userId);
      return await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    });
  },

  async fetchOrganizationMembership(userId: string) {
    return apiClient.query(async () => {
      console.log('Fetching organization membership for user:', userId);
      
      const { data: memberships } = await supabase
        .rpc('get_user_organization_membership_safe', { user_uuid: userId });
      
      if (!memberships || memberships.length === 0) {
        return null;
      }

      const membership = memberships[0];
      
      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('id', membership.organization_id)
        .single();
      
      if (orgError) {
        throw orgError;
      }
      
      return {
        id: membership.id,
        organization_id: membership.organization_id,
        role: membership.role,
        organization: {
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug
        }
      };
    });
  }
};
