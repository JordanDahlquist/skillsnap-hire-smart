
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

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
  default_organization_id: string | null;
}

interface OrganizationMembership {
  id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  organization: {
    id: string;
    name: string;
    slug: string | null;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizationMembership, setOrganizationMembership] = useState<OrganizationMembership | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn('Profile fetch error:', error.message);
        return null;
      }
      
      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.warn('Profile fetch exception:', error);
      return null;
    }
  };

  const fetchOrganizationMembership = async (userId: string) => {
    try {
      console.log('Fetching organization membership for user:', userId);
      
      const { data: memberships, error: membershipsError } = await supabase
        .from('organization_memberships')
        .select('*')
        .eq('user_id', userId)
        .limit(1);
      
      if (membershipsError) {
        console.warn('Organization membership fetch error:', membershipsError.message);
        return null;
      }

      if (!memberships || memberships.length === 0) {
        console.log('No organization membership found for user:', userId);
        return null;
      }

      const membership = memberships[0];
      
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', membership.organization_id)
        .single();
      
      if (orgError) {
        console.warn('Organization fetch error:', orgError.message);
        return null;
      }

      const result = {
        ...membership,
        organization
      };
      
      console.log('Organization membership fetched successfully:', result);
      return result;
    } catch (error) {
      console.warn('Organization membership fetch exception:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('Auth hook initializing...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile and organization data with error handling
          try {
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
            
            const orgMembership = await fetchOrganizationMembership(session.user.id);
            setOrganizationMembership(orgMembership);
          } catch (error) {
            console.error('Error fetching user data:', error);
            // Don't block the auth flow if data fetching fails
          }
        } else {
          setProfile(null);
          setOrganizationMembership(null);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id || 'No session');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
          
          const orgMembership = await fetchOrganizationMembership(session.user.id);
          setOrganizationMembership(orgMembership);
        } catch (error) {
          console.error('Error fetching initial user data:', error);
        }
      }
      
      setLoading(false);
    });

    // Failsafe timeout
    const timeout = setTimeout(() => {
      console.log('Auth loading timeout reached, setting loading to false');
      setLoading(false);
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setProfile(null);
      setOrganizationMembership(null);
      
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('Refreshing profile and organization data...');
      try {
        const userProfile = await fetchProfile(user.id);
        setProfile(userProfile);
        
        const orgMembership = await fetchOrganizationMembership(user.id);
        setOrganizationMembership(orgMembership);
        
        console.log('Refreshed profile:', userProfile);
        console.log('Refreshed organization membership:', orgMembership);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  return {
    user,
    session,
    profile,
    organizationMembership,
    loading,
    signOut,
    refreshProfile,
    isAuthenticated: !!session && !!user
  };
};
