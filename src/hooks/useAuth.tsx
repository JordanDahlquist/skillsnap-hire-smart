
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
  const [dataLoading, setDataLoading] = useState(false);

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
      
      // First, try to get user's memberships directly
      const { data: memberships, error: membershipsError } = await supabase
        .from('organization_memberships')
        .select('*')
        .eq('user_id', userId)
        .limit(1);
      
      if (membershipsError) {
        console.error('Organization membership fetch error:', membershipsError);
        return null;
      }

      if (!memberships || memberships.length === 0) {
        console.log('No organization membership found for user:', userId);
        return null;
      }

      const membership = memberships[0];
      console.log('Found membership:', membership);

      // Now get the organization details
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', membership.organization_id)
        .single();

      if (orgError) {
        console.error('Organization fetch error:', orgError);
        // Return membership without organization details
        return {
          ...membership,
          organization: {
            id: membership.organization_id,
            name: 'Unknown Organization',
            slug: null
          }
        };
      }

      const result = {
        ...membership,
        organization
      };
      
      console.log('Organization membership fetched successfully:', result);
      return result;
    } catch (error) {
      console.error('Organization membership fetch exception:', error);
      return null;
    }
  };

  const loadUserData = async (userId: string) => {
    setDataLoading(true);
    try {
      console.log('Loading user data for:', userId);
      
      // Load profile and organization data in parallel
      const [userProfile, orgMembership] = await Promise.allSettled([
        fetchProfile(userId),
        fetchOrganizationMembership(userId)
      ]);
      
      if (userProfile.status === 'fulfilled') {
        setProfile(userProfile.value);
        console.log('Profile loaded:', userProfile.value?.full_name || 'No name');
      } else {
        console.warn('Failed to load profile:', userProfile.reason);
        setProfile(null);
      }
      
      if (orgMembership.status === 'fulfilled') {
        setOrganizationMembership(orgMembership.value);
        console.log('Organization membership loaded:', orgMembership.value?.role || 'No membership');
      } else {
        console.warn('Failed to load organization membership:', orgMembership.reason);
        setOrganizationMembership(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    console.log('Auth hook initializing...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Load additional user data without blocking authentication
          setTimeout(() => {
            loadUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setOrganizationMembership(null);
          setDataLoading(false);
        }
        
        // Authentication loading is complete regardless of data loading
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id || 'No session');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Load additional user data without blocking authentication
        setTimeout(() => {
          loadUserData(session.user.id);
        }, 0);
      } else {
        setDataLoading(false);
      }
      
      // Authentication loading is complete
      setLoading(false);
    });

    // Failsafe timeout for auth loading
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
      // Clear local state first
      setUser(null);
      setSession(null);
      setProfile(null);
      setOrganizationMembership(null);
      
      // Clear browser storage
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
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('Refreshing profile and organization data...');
      await loadUserData(user.id);
    }
  };

  return {
    user,
    session,
    profile,
    organizationMembership,
    loading,
    dataLoading,
    signOut,
    refreshProfile,
    isAuthenticated: !!session && !!user
  };
};
