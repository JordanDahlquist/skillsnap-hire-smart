
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

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
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
        // Don't throw error, just return null and continue
        return null;
      }
      
      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.warn('Profile fetch exception:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('Auth hook initializing...');
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id || 'No session');
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile but don't block loading state
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      }
      
      // Always set loading to false after initial session check
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id || 'No session');
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile in background, don't affect loading state
          setTimeout(async () => {
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
          }, 0);
        } else {
          setProfile(null);
        }
        
        // Set loading to false for auth state changes
        setLoading(false);
      }
    );

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
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = '/';
    }
  };

  return {
    user,
    profile,
    loading,
    signOut,
  };
};
