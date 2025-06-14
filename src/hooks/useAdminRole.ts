
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminRole = () => {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.id) {
        console.log('No user ID, setting admin to false');
        setIsSuperAdmin(false);
        setIsLoading(false);
        return;
      }

      console.log('Checking admin role for user:', user.id);

      try {
        // Use the security definer function to check super admin role
        const { data, error } = await supabase
          .rpc('is_super_admin', { _user_id: user.id });

        if (error) {
          console.error('Error checking admin role:', error);
          setIsSuperAdmin(false);
        } else {
          console.log('Admin role check result:', data);
          setIsSuperAdmin(!!data);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsSuperAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [user?.id]);

  return { isSuperAdmin, isLoading };
};
