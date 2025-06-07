
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
      
      // First try to get the user's membership
      const { data: memberships, error: membershipsError } = await supabase
        .from('organization_memberships')
        .select('*')
        .eq('user_id', userId);
      
      if (membershipsError) {
        console.warn('Organization membership fetch error:', membershipsError.message);
        return null;
      }

      if (!memberships || memberships.length === 0) {
        console.log('No organization membership found for user:', userId);
        return null;
      }

      // Get the first membership (users should typically have one primary membership)
      const membership = memberships[0];
      
      // Fetch the organization details
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
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile and organization in background, don't affect loading state
          setTimeout(async () => {
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
            
            const orgMembership = await fetchOrganizationMembership(session.user.id);
            setOrganizationMembership(orgMembership);
            
            // If no organization membership found, log for debugging
            if (!orgMembership) {
              console.log('User has no organization membership - Organization tab will not appear');
            }
          }, 0);
        } else {
          setProfile(null);
          setOrganizationMembership(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id || 'No session');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
        
        const orgMembership = await fetchOrganizationMembership(session.user.id);
        setOrganizationMembership(orgMembership);
        
        // Debug logging
        console.log('User profile loaded:', userProfile);
        console.log('Organization membership loaded:', orgMembership);
      }
      
      setLoading(false);
    });

    // Failsafe: ensure loading never stays true indefinitely
    const timeout = setTimeout(() => {
      console.log('Auth loading timeout reached, setting loading to false');
      setLoading(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all state
      setUser(null);
      setSession(null);
      setProfile(null);
      setOrganizationMembership(null);
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('Refreshing profile and organization data...');
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
      
      const orgMembership = await fetchOrganizationMembership(user.id);
      setOrganizationMembership(orgMembership);
      
      console.log('Refreshed profile:', userProfile);
      console.log('Refreshed organization membership:', orgMembership);
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
